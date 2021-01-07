function hapus(x) {

        //parse campground id
        const pathname = window.location.pathname; //campground/14124124
        const id = pathname.split('/')[2]; //124124214
        //parse image id
        const input = x.querySelector('input').value
        const imageId = input.split('/')[1]

        const url = `/campground/${id}/KostKita/${imageId}`

        axios({
                method: 'post',
                url: url,
                //use form encoded not aplication/json
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .then(res => {
                console.log(res)
                console.log('succeed')

            });

            location.reload()

        const img = x.parentNode.parentNode.querySelector('img')
        x.remove();
        img.remove();


}