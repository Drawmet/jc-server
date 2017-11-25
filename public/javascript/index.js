document.getElementById('sign_in').onclick = () => {
    fetch('/login',{
        method: 'POST',
        body: JSON.stringify({
            login: document.getElementById('login').value,
            password: document.getElementById('password').value
        }),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          },
    }).then(res => res.json()).then(data => {
        if(data){
            redirect: window.location.replace(data.redirect);
        } else{
            alert("Invalid Email or Password");
        }
    });
}