import { TextureRenderingTarget } from "../materials/ITextureRenderingTarget";
import { Frustrum, PLACEMENT } from "../mesh/frustrum";
import { WorldMesh } from "../mesh/WorldMesh";

export interface RenderList {
    opaque:WorldMesh[],
    transparent:WorldMesh[],
    textureRenderingTargets:Set<TextureRenderingTarget> // TODO: how do we implement this? 
}

/**
 * Distance z: This is distance from the fucking camera (remember the right direction) 
 * TODO: do some prelim-checks for if stuff is behind the camera frustrum before the frustrum culling? 
 * TODO: add possibility to set custom opaque and transparent sorting functions? 
 * 
 * 
 * Handle: for culled items 
 * - Frustrum culling 
 * - Opaque: Distance from the camera
 * - Transparent: Painters algorithm 
 * 
 * Remember: worldMeshes can be set to "!frustrumCull", ala SkyBox  
 */
export class RenderListGenerator {
    
    constructor(){
        console.log("RenderList:constructor()"); 
    }
    
    public genRenderList(worldMeshes:WorldMesh[], frustrum:Frustrum, cameraPosition:Float32Array, createTexTargetList:boolean):RenderList {
        let itemsToRender:RenderList = this._genFrustrumCulledList(worldMeshes, frustrum, cameraPosition, createTexTargetList); 
        itemsToRender = this._sortCulledItems(itemsToRender); 
        
        return itemsToRender; 
    }
    
    /**
     * Create a render list where we only sort by distance from the camera, not by transparency. 
     * Useful for things like creating depth passes 
     * @param worldMeshes 
     * @param frustrum 
     * @param cameraPosition 
     * @param createTexTargetList 
     * 
     * @returns a renderlist where all items are stored in .opaque 
     */
    public genRenderListNoTransparency(worldMeshes:WorldMesh[], frustrum:Frustrum, cameraPosition:Float32Array):RenderList {
        const renderItems:RenderList = {opaque: [], transparent: [], textureRenderingTargets: new Set<TextureRenderingTarget>()}; 

        for(let i=0; i<worldMeshes.length; ++i) {
            const worldMesh = worldMeshes[i]; 
            
            if(worldMesh.render) {
                /* If the mesh should not be frustrum culled or if it either intersects or is inside the frustrum: add it */
                if(!worldMesh.frustrumCull || (frustrum.boxInFrustum(worldMesh.AABBBoundingBox) != PLACEMENT.OUTSIDE)) {
                    /* Need this to sort the render-order of items */
                    worldMesh.setDistanceToCamera(cameraPosition); 
                    
                    renderItems.opaque.push(worldMesh);  
                } 
            }
        }
        renderItems.opaque.sort(this._opaqueSort); 
        return renderItems; 
    }
    
    /**
     * Extracts the meshes that should be rendered and adds some stats
     * 
     * NOTE: This function probably needs to be updated when dealing with semi-transparent meshes. 
     * NOTE: Items that are semi-transparent will be sorted as transparent. 
     * 
     * @param worldMeshes
     * @param createTexTargetList Creating a list of texture targets is not required for things like depth textures.
     * @returns 
     */
    private _genFrustrumCulledList(worldMeshes:WorldMesh[], frustrum:Frustrum, cameraPosition:Float32Array, createTexTargetList:boolean):RenderList {
        const renderItems:RenderList = {opaque: [], transparent: [], textureRenderingTargets: new Set<TextureRenderingTarget>()}; 

        for(let i=0; i<worldMeshes.length; ++i) {
            const worldMesh = worldMeshes[i]; 

            if(worldMesh.render) {
                /* If the mesh should not be frustrum culled or if it either intersects or is inside the frustrum: add it */
                if(!worldMesh.frustrumCull || (frustrum.boxInFrustum(worldMesh.AABBBoundingBox) != PLACEMENT.OUTSIDE)) {
                    /* Need this to sort the render-order of items */
                    worldMesh.setDistanceToCamera(cameraPosition); 

                    if(createTexTargetList) {
                        const currTexRenderTargets = worldMesh.getTextureRenderingTargets(); 
                        currTexRenderTargets.forEach(renderItems.textureRenderingTargets.add, renderItems.textureRenderingTargets); 
                        //renderItems.textureRenderingTargets.forEach(renderItems.textureRenderingTargets.add, renderItems.textureRenderingTargets); 
                    }
                    
                    if(worldMesh.isTransparent) {
                        renderItems.transparent.push(worldMesh); 
                    } else {
                        renderItems.opaque.push(worldMesh);  
                    }
                } else {
                    //console.log("worldMesh culled"); 
                }
            } 
        }
        
        return renderItems; 
    }
    
    /**
     * Run painters algorithm on opaque and transparent items 
     * @param culledItems 
     */
    private _sortCulledItems(renderList:RenderList):RenderList {
        renderList.opaque.sort(this._opaqueSort); 
        renderList.transparent.sort(this._transparentSort); 

        return renderList; 
    }


    private _opaqueSort(one:WorldMesh, two:WorldMesh):number {
        if(one.material.getShaderID() !== two.material.getShaderID()) {
            // TODO: replace with getter?
            return one.material.getShaderID() - two.material.getShaderID();
        } else {
            return one.distanceFromCamera - two.distanceFromCamera;
        }
    }
    
    /**
     * Method: 
     * - Sort by distance from the camera first. The furthest back first 
     * - Sort by shader id's second 
     * 
     * @param culledItems 
     */
    private _transparentSort(one:WorldMesh, two:WorldMesh):number {
        if(one.material.getShaderID() !== two.material.getShaderID()) {
            return two.distanceFromCamera, one.distanceFromCamera;
        } else {
            return one.material.getShaderID() - two.material.getShaderID();
        }
    }
}