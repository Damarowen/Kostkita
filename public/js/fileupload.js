
const find_upload = document.querySelector('.custom-file-container')

if(find_upload) {
var upload = new FileUploadWithPreview('myUniqueUploadId', {
    text: {
        chooseFile: ' Max 3 File'
    }
    })
}