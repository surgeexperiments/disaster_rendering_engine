
interface myCallbackType { (images:Record<string,HTMLImageElement>, log:Record<string,string[]>): void }


export class ImageLoader {
    load(images:Record<string,HTMLImageElement>, callback:myCallbackType):void{
        // Keep the count of the verified images
        let allLoaded = 0;
    
        // The object that will be returned in the callback
        const _log:Record<string,string[]> = {
            success: [],
            error: []
        };
    
        // Executed everytime an img is successfully or wrong loaded
        const verifier = function(){
            allLoaded++;
    
            // triggers the end callback when all images has been tested
            //if(allLoaded == Images.length){
            //    Callback.call(undefined, _log, images);
           // }
        };
        
        // Loop through all the images URLs
        //for (var index = 0; index < Images.length; index++) {
        for(const imgSource in images) {
            // Prevent that index has the same value by wrapping it inside an anonymous fn
            (function(key){
                // Image path providen in the array e.g image.png
                //var imgSource = images[key];
                const img = new Image();
                
                img.addEventListener("load", function(){
                    _log.success.push(imgSource);
                    verifier();
                    if(allLoaded == Object.keys(images).length) callback.call(undefined, images, _log);
                }, false); 
                
                img.addEventListener("error", function(){
                    _log.error.push(imgSource);
                    verifier();
                }, false); 
               
                img.src = imgSource;
    
                images[key] = img; 
            //})(index);
            })(imgSource);
        }
    }
}


