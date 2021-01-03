function changeState() {

    

    var btnLike = document.getElementById('btnLike');
    var btnUnlike = document.getElementById('btnUnlike');

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
    var fas = document.getElementById('fas');
    fas.classList.add('fa-thumbs-up')

    //sent http request to sever with axios
    axios({
            method: 'post',
            url: '/campground/<%= show_camp._id %>/like',
            //use form encoded not aplication/json
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(res => {
            console.log(res)
        });

}


bsCustomFileInput.init()
