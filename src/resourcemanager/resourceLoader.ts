import { ImageListURL } from "./sceneLoader";


/**
 * TODO: Expand so it loads all kinds of resources 
 * @author SurgeExperiments
 */
export class ResourceLoader {
    /**
     * This function blocks while it loads images (lol) 
     * @param urls 
     * @returns {url:HTMLImageElement} or it throws an error if it fails 
     */
    public loadImages(urls:Set<string>):void {
        const images:ImageListURL = {}; 
        const promises = []; 

        for(const url of urls) {
            promises.push(
                new Promise ( (resolve, reject) => {
                    images[url] = new Image(); 
                    images[url].addEventListener("load", function(){
                        resolve(true); 
                    }); 
                    images[url].addEventListener("error", function(){
                        reject("Error loading image: " + url); 
                    });
                    images[url].src = url; 
                })
            )
        }
        
        Promise.all(promises).then(
            result => { 
                console.log("loadImages(): succeeded"); 
                return images; 
            },
            error => {
                throw new Error("LoadImages: could not load " + error.message); 
            }
        )
    }

    public loadImages2(urls:Set<string>):Promise<unknown> {
        const images:ImageListURL = {}; 
        const promises = []; 

        for(const url of urls) {
            promises.push(
                new Promise ( (resolve, reject) => {
                    images[url] = new Image(); 
                    images[url].addEventListener("load", function(){
                        resolve(true); 
                    }); 
                    images[url].addEventListener("error", function(){
                        reject("Error loading image: " + url); 
                    });
                    images[url].src = url; 
                })
            )
        }
        
        return Promise.all(promises); 
    }
}

