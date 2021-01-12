function hapus(x) {


    //*parse kost id
    const pathname = window.location.pathname; //kost/14124124
    const id = pathname.split('/')[2]; //124124214
    //*parse image id
    const input = x.querySelector('input').value
    const imageId = input.split('/')[1]

    //*flash message
    const info = document.querySelector('#info')
    let div = document.createElement('div');
    const text = document.createTextNode(`${imageId} Deleted...`)
    div.className = 'alert alert-danger text-center';
    div.appendChild(text);

    const container = document.querySelector(".edit");
    container.insertBefore(div, info);
   

    const url = `/kost/${id}/KostKita/${imageId}`

    //*axios
    axios({
            method: 'post',
            url: url,
            //*use form encoded not aplication/json
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(res => {
            console.log(res)
            console.log('succeed')

        });

//*remove image
    const img = x.parentNode.parentNode.querySelector('img')
    x.remove();
    img.remove();


    //*timeout flash message
    function alert () {
        const alert = document.querySelector('.alert')
        alert.remove();
      }
     
      window.setTimeout(alert,3000)
      console.log(alert)
}