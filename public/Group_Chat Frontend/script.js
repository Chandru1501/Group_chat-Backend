let page = document.querySelector('#page').textContent;
console.log(page);

if(page==="Signup")  { 

let Username = document.querySelector('#name');
let Email = document.querySelector('#email');
let Phone = document.querySelector('#phone');
let Password = document.querySelector('#password');
let ConfirmPw = document.querySelector('#confirmPw');
let forms = document.querySelector('form');
let mismatch = document.querySelector('#mismatch');
let exists  = document.querySelector('#exist');
let btn = document.querySelector('#signupbtn')

btn.addEventListener('click',()=>{
    mismatch.style.display='none';
    exists.style.display='none';
})

forms.onsubmit = signup;

async function signup (event) {
    event.preventDefault();

    let obj = {
        Name : Username.value,
        Email : Email.value,
        Phone : Phone.value,
        Password : Password.value
    }
    console.log(obj);
    
    if( Password.value === ConfirmPw.value ) {
        let res = await postUser(obj);
        console.log(res)
        if(res.data.message==='somthing went wrong'){
            alert("Something Went Wrong Please try again later")
        }
        if(res.data.message==='success'){
            alert("Signup Successfull please Login to continue")
            location.replace('./login.html');
        }
        if(res.data.message==='user exists'){
            exists.style.display="block";
        }
    } else{
         mismatch.style.display = "block"
       } 
}

async function postUser(myobj){
    try{
    let response = await axios.post('https://groupchat.chandraprakash.tech/user/signup',myobj);
    console.log(response);
    return response
    }
    catch(err){
    return err.response;
    }
}
}

if(page==="Login")  {
  let Email = document.querySelector('#loginemail')
  let Password = document.querySelector('#loginpassword')
  let loginBtn = document.querySelector('#loginbtn')
  let notFound = document.querySelector('#usernotfound')
  let wrongPw = document.querySelector('#wrongpassword')
  let form = document.querySelector('form');

  form.onsubmit = login;

  loginBtn.addEventListener('click',()=>{
    notFound.style.display='none'
    wrongPw.style.display='none'
  })

  async function login(event){
    event.preventDefault();
    let obj = {
        Email : Email.value,
        Password : Password.value
    }
    console.log(obj)
    let res = await loginApi(obj)
    console.log(res);
    if(res.data.message==='something wrong'){
        alert("Something Went Wrong Please try again later")
    }
    if(res.data.message==='usernotfound'){
        notFound.style.display='block';
    }
    if(res.data.message==='incorrect password'){
        wrongPw.style.display='block';
    }
    if(res.data.message==='login successfull'){
        alert("Login successfull");
        let token = res.data.Token;
        let Username = res.data.Username;
        let Id = res.data.Id;
        console.log(token);
        localStorage.setItem('Token',token);
        localStorage.setItem('Username',Username);
        location.replace('./Chat/chat.html')
    }
  }

  async function loginApi(obj){
    try{
        let response = await axios.post('https://groupchat.chandraprakash.tech/user/login',obj)
        return response;
    }
    catch(err){
        return err.response;
    }
  }

} 

if(page==='Forgot Password'){
    let form = document.querySelector('#forgotform');
    let notfound = document.querySelector('#usernotfound');

    form.onsubmit = sendresetMail;

   async function sendresetMail(e){
    try{
        e.preventDefault();
        notfound.style.display='none';
        let Emailinput = document.querySelector('#forgotemail').value;
 
        let Email = {
         Email : Emailinput
        } 
        let response = await ResetApi(Email);
        if(response==='user not found'){
            notfound.style.display='block';
        }
        else{
           alert(response);
        }
    }
    catch(err){
        console.log(err);
    }
    }

    async function ResetApi(Email){
        try{
            let response = await axios.post('https://groupchat.chandraprakash.tech/password/forgotpassword',Email);
            console.log(response);
            return response.data.message;
        }
        catch(err){
            console.log(err);
            return err.response.data.message;
        }
    }
}