function changeState() {

    //**use this to parse camp id in url address bar */
    const pathname = window.location.pathname; //campground/14124124
    const id = pathname.split('/')[2]; //124124214
    const url = `/campground/${id}/like`
    
    const btnLike = document.getElementById('btnLike');
    const btnUnlike = document.getElementById('btnUnlike');

    // btnLike True
    if (btnLike) {

        btnLike.setAttribute('class', 'btn btn-sm btn-success')
        // redefine inside button tag
        btnLike.innerHTML = "<span><i id=fas class=fas ></i></span> You Like This Post"
        // chang id to button unlike for next click
        btnLike.id = "btnUnlike"

    } else {
        btnUnlike.setAttribute('class', 'btn btn-sm btn-secondary')
        // redefine inside button tag
        btnUnlike.innerHTML = "<span><i id=fas class=fas ></i></span> Like"
        // chang id to button like for next click
        btnUnlike.id = "btnLike"
    }

    // insert logo thumbs up 
    const fas = document.getElementById('fas');
    fas.classList.add('fa-thumbs-up')

    //sent http request to sever with axios
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
        });

}

