

/**
 * Borrowed from: https://ourcodeworld.com/articles/read/571/how-to-verify-when-multiple-images-have-been-loaded-in-javascript
 * Loader function that helps to trigger a callback when multiple images has been loaded. Besides
 * indicates which images were correctly/wrong loaded.
 * 
 * NOTE: This will create a stack frame that sits below every follow-up function.
 * 
 * @param {Array} Images An array of strings with the paths to the images.
 * @param {Function} Callback Callback function executed when all images has been loaded or not.
 */
 function ImageLoader(Images, Callback){
    // Keep the count of the verified images
    var allLoaded = 0;

    let images = []; 

    // The object that will be returned in the callback
    var _log = {
        success: [],
        error: []
    };

    // Executed everytime an img is successfully or wrong loaded
    var verifier = function(){
        allLoaded++;

        // triggers the end callback when all images has been tested
        //if(allLoaded == Images.length){
        //    Callback.call(undefined, _log, images);
       // }
    };
    
    // Loop through all the images URLs
    for (var index = 0; index < Images.length; index++) {
    //for(let key in Images) {
        // Prevent that index has the same value by wrapping it inside an anonymous fn
        (function(index){
            // Image path providen in the array e.g image.png
            var imgSource = Images[index];
            var img = new Image();
            
            img.addEventListener("load", function(){
                _log.success.push(imgSource);
                verifier();
                if(allLoaded == Images.length) Callback.call(undefined, _log, images);
            }, false); 
            
            img.addEventListener("error", function(){
                _log.error.push(imgSource);
                verifier();
            }, false); 
           
            img.src = imgSource;

            images[index] = img; 
        })(index);
        //})(key);
    }
}


function ImageLoader2(Images, Callback){
    // Keep the count of the verified images
    var allLoaded = 0;

    let images = {}; 

    // The object that will be returned in the callback
    var _log = {
        success: [],
        error: []
    };

    // Executed everytime an img is successfully or wrong loaded
    var verifier = function(){
        allLoaded++;

        // triggers the end callback when all images has been tested
        //if(allLoaded == Images.length){
        //    Callback.call(undefined, _log, images);
       // }
    };
    
    // Loop through all the images URLs
    //for (var index = 0; index < Images.length; index++) {
    for(let key in Images) {
        // Prevent that index has the same value by wrapping it inside an anonymous fn
        (function(key){
            // Image path providen in the array e.g image.png
            var imgSource = Images[key];
            var img = new Image();
            
            img.addEventListener("load", function(){
                _log.success.push(imgSource);
                verifier();
                if(allLoaded == Object.keys(Images).length) Callback.call(undefined, _log, images);
            }, false); 
            
            img.addEventListener("error", function(){
                _log.error.push(imgSource);
                verifier();
            }, false); 
           
            img.src = imgSource;

            images[key] = img; 
        //})(index);
        })(key);
    }
}
