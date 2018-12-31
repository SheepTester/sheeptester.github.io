/**
 * Extract the file name given a string of the form fileName + ext
 * @param {string} nameExt File name + extension (e.g. 'my_image.png')
 * @return {string} The name without the extension, or the full name if
 * there was no '.' in the string (e.g. 'my_image')
 */
const extractFileName = function (nameExt) {
    // There could be multiple dots, but get the stuff before the first .
    const nameParts = nameExt.split('.', 1); // we only care about the first .
    return nameParts[0];
};

/**
 * Handle a file upload given the input element that contains the file,
 * and a function to handle loading the file.
 * @param {Input} fileInput The <input/> element that contains the file being loaded
 * @param {Function} onload The function that handles loading the file
 */
const handleFileUpload = function (fileInput, onload) {
    let thisFile = null;
    const reader = new FileReader();
    reader.onload = () => {
        // Reset the file input value now that we have everything we need
        // so that the user can upload the same sound multiple times if
        // they choose
        fileInput.value = null;
        const fileType = thisFile.type;
        const fileName = extractFileName(thisFile.name);

        onload(reader.result, fileType, fileName);
    };
    if (fileInput.files) {
        thisFile = fileInput.files[0];
        reader.readAsArrayBuffer(thisFile);
    }
};

export {
    handleFileUpload
};
