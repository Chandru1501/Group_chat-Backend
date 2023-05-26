import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const socket = io.connect('/');

let messagesCount=0;

var selectedGroup;

// const socket = io('http://localhost:8000')

window.addEventListener('DOMContentLoaded',ShowwelcomeMessage);

let messagelist = document.querySelector('#messagelist');
function ShowwelcomeMessage(){
  let welcome = document.createElement('h2');
  welcome.id = "welcome";
  welcome.textContent = "Welcome to Group Chat App Select a group to View Messages";
  messagelist.appendChild(welcome);
}


// new group 
let NewGroupBtn = document.querySelector('#newgroupbtn');
let formclosebtn = document.querySelector('#closeform');
let Newgroupbox = document.querySelector('#newGroupform');
let submitform = document.querySelector('#creategroupform');

NewGroupBtn.addEventListener('click',async()=>{
  let token = localStorage.getItem('Token');
  let response = await axios.get('http://localhost:8000/group/getallmembers',{ headers : {'authorization' : token} })
  let Allusers = response.data.Allusers
  console.log(Allusers);

  addToSelectList(Allusers);
})

let count = 0;
let allusers;
function addToSelectList(Allusers) {
  allusers = Allusers;
  if(count>0){
    Newgroupbox.style. visibility = 'visible';
    return
  }
  var selectElements = document.getElementById("totalusers");
  console.log(selectElements);
  Allusers.forEach(Element=>{
    let option = document.createElement('option');
    option.textContent = Element.Username
    selectElements.appendChild(option);
  })
    $(selectElements).selectpicker('refresh');
  Newgroupbox.style. visibility = 'visible';
  count++;
}

formclosebtn.addEventListener('click',()=>{
  Newgroupbox.style. visibility = 'hidden';
})

let groupName = document.querySelector('#groupnameinput');;


submitform.onsubmit = createGroup;

async function createGroup(e) {
  try{
    e.preventDefault();
  let GroupName = groupName.value;
  
  let selectedValues = [];
  let selectElement = document.getElementById("totalusers");
  for (var i = 0; i < selectElement.options.length; i++) {
    let option = selectElement.options[i];
    if (option.selected) {
      selectedValues.push(option.value || option.text);
    }
  }
 let selectedaddedId = [];

selectedValues.forEach(selected=>{
  allusers.forEach(user=>{
    if(user.Username===selected){
      selectedaddedId.push({
        Id : user.Id,
        Username : user.Username
      })
    }
  })
})
let thisuser = localStorage.getItem('Username');

let NewgroupObj = {
  GroupName : GroupName,
    GroupMembers : selectedaddedId,
    CreatedBy : thisuser
  }
  console.log(NewgroupObj);
  
  let token = localStorage.getItem('Token');
  
  let response = await axios.post('http://localhost:8000/group/creategroup',NewgroupObj,{ headers : { "authorization" : token } });
  console.log(response);
  if(response.data.message==='successfully created'){
    alert('New Group created successfully');
    Newgroupbox.style. visibility = 'hidden';
    let Createdgroup = response.data.createdgroup;
    console.log(Createdgroup);
    let localGroupdata = JSON.parse(localStorage.getItem('Allgroups'));
    if(localGroupdata===null || localGroupdata.length === 0){
         localGroupdata = [];
         localGroupdata.push(Createdgroup);
         localStorage.setItem('Allgroups',JSON.stringify(localGroupdata));   
    }
    else{
      localGroupdata.push(Createdgroup);
      localStorage.setItem('Allgroups',JSON.stringify(localGroupdata));   
    }
    console.log(Createdgroup.GroupName);
    displayGroups([Createdgroup]); // beacuse we are using foreach
  }
}
catch(err){
  console.log(err);
  alert('some error occured');
}
}


//getting all groups list
let refreshGroupBtn = document.querySelector('#refreshgroup');

refreshGroupBtn.addEventListener('click',getAllgroups);

let  grouprefreshCount = 0;
async function getAllgroups(){
  if(grouprefreshCount!=1){
    let token = localStorage.getItem('Token');
    let response = await axios.get('http://localhost:8000/group/getallgroups',{headers : {"authorization" : token }})
    console.log(response);
    let Allgroups = response.data.Allgroups;
    localStorage.setItem('Allgroups',JSON.stringify(Allgroups));
    document.querySelector('#grouplist').textContent="";
    displayGroups(Allgroups);
    grouprefreshCount = 1;
  }
}

// when domcontend loaded

window.addEventListener('DOMContentLoaded',listallGroups);

function listallGroups(){
  let Allgroups = JSON.parse(localStorage.getItem('Allgroups'));
  if(Allgroups){
    displayGroups(Allgroups);
  }
  else{
    getAllgroups();
  }
}
var grouptitle;

setInterval(async()=>{
 grouptitle = document.querySelector('.groupname').textContent;
let infobtn = document.querySelector('#groupinfobtn');
let deletegroupbtn = document.querySelector('#deletegroupbtn');
if(grouptitle!='Group chat') {
 infobtn.style.display="block";
 deletegroupbtn.style.display="block";
}
},500);

let Grouplist = document.querySelector('#grouplist'); 

// displaying groupslist and added event listener to get all messages with respect to when clicked

var backcount=0;
function displayGroups(Allgroups){
  console.log(Allgroups);
  Allgroups.forEach(group=>{
    let groupname = group.GroupName;
    let h2 = document.createElement('h2');
    h2.id = "groupname";
    h2.textContent = groupname;
    h2.style.backgroundColor="#c8c8c8"
    h2.addEventListener('click',async()=>{
      try{
        
        socket.emit('group-opened',groupname);

        document.querySelector('#groupinfopage').style.display='none';
        document.querySelector('#Entermessage').value = '';
        let messagelist = document.querySelector('#messagelist');
        messagelist.textContent='';
        document.querySelector('.groupname').textContent=groupname;
        document.querySelector('#chatingbox').style.display='block';
        let selectedGroup = h2.textContent
        let localGroups = JSON.parse(localStorage.getItem('Allgroups'));
        let myGroupId;
        localGroups.forEach(group=>{
          if(group.GroupName===selectedGroup){
             myGroupId = group.id;
          }
        })
        console.log("selected group's ID = "+myGroupId);

     let localmessage = localStorage.getItem(groupname);
  if(localmessage){
    let localmessages = JSON.parse(localmessage);
      console.log(localmessages); 
      assembleData(localmessages);
      setTimeout(()=>{
        getAndDisplayMessages();
      },1000);
   }
   else{
    let messagesfromApi = await getmessagesApi(myGroupId,0);
    if(messagesfromApi.length>0){
      localStorage.setItem(groupname,JSON.stringify(messagesfromApi));
      assembleData(messagesfromApi);
    }
    else{
      let h2 = document.createElement('h2');
      h2.id = "nomessages";
      h2.textContent='No Messages';
      messagelist.appendChild(h2);
       }
     }
   }      
      catch(err){
        console.log(err);
        alert('some error occured');
      }
    })
    h2.addEventListener('click',()=>{
      //getAndDisplayMessages();
      if (window.matchMedia("(max-width: 480px)").matches) {
            console.log("Screen size is below 480 pixels");
            let groupterminal = document.querySelector('#listofgroups');
            let chatterminal = document.querySelector('#chattingTerminal');
              groupterminal.style.display="none";
              chatterminal.style.display='block';
              if(backcount===0){
                let messagestitle = document.querySelector('#messages');
                let backBtn = document.createElement('button');
                let chatingbox = document.querySelector('#chatingbox');
                backBtn.id = 'backtogroups';
                backBtn.className ='btn btn-warning'
                backBtn.textContent = 'Back'
                messagestitle.appendChild(backBtn);
                backBtn.addEventListener('click',()=>{
                  chatterminal.style.display='none';
                  groupterminal.style.display='block';
                  chatingbox.style.display='none';
                  document.querySelector('#groupinfopage').style.display='none';
                  document.querySelector('#addmemberspage').style.display='none';
                  document.querySelector('#fileform').style.display='none';
                  document.querySelector('#addmembersbtn').textContent='Add members'
                })
                backcount=1;
              }
      }
    })
    h2.addEventListener('mouseenter',()=>{
      h2.style.backgroundColor="#9678b6";
    })
    h2.addEventListener('mouseleave',()=>{
      h2.style.backgroundColor="#c8c8c8";
    })
    Grouplist.appendChild(h2);
  })
}

var grouptitle;
var groupId;

// to check the current group


// calling backend for getting messages with respect to group

async function getmessagesApi(myGroupId,lastmessageId){
try{
  let token = localStorage.getItem('Token');
  let response = await axios.get(`http://localhost:8000/group/getgroupmessages/${lastmessageId}`,{ 
    headers : {  
       'authorization' : token,
       'groupId' : myGroupId
     } 
});
  console.log(response.data.messageData);
  return response.data.messageData;
}
catch(err){
  console.log(err);
  return 0;
}

}


/// sending messages in group

let message = document.querySelector('#Entermessage');
let sendBtn = document.querySelector('#sendbtn');
let messageList = document.querySelector('#messagelist');

document.querySelector('#textform').onsubmit = sendMessage;

async function sendMessage(event){
  event.preventDefault();
  let usermessage = message.value;
  //console.log(usermessage);
  let response = await sendMessageToApi(usermessage);
  //console.log(response);
}

async function sendMessageToApi(message){
  try{
    //console.log(message);
  let groupname = document.querySelector('.groupname').textContent;
  let token = localStorage.getItem('Token');
  let groupId;
  let localGroups = JSON.parse(localStorage.getItem('Allgroups'));
  localGroups.forEach(group=>{
    if(group.GroupName===groupname){
      groupId = group.id;
      } 
  })

  let obj = {
    GroupId : groupId,
    Message : message
  }

  socket.emit('send-message',obj,token,grouptitle);
var count=0;

   console.log(obj);
  // let response = await axios.post('http://localhost:8000/messages/sendmessage',obj,{ headers : { "authorization" : token } });
   document.querySelector('#Entermessage').value = "";
   let localchat = localStorage.getItem(groupname);
   if(!localchat){
   document.querySelector('#nomessages').style.display='none';
   }
  // return response;
}

catch(err){
  console.log(err);
  alert('error occured');
}
}

socket.on("receive-message", async (msg) => {
  console.log(msg)
  getAndDisplayMessages();
});

socket.on('response-to-user',(msg)=>{
  console.log(msg);
  if(msg!='message sent'){
    alert(msg);
  }
})

async function getAndDisplayMessages() {
  let localGroupmessage =  localStorage.getItem(grouptitle);
  //console.log(localGroupmessage);
  if(localGroupmessage){
      let localGroupmessages = JSON.parse(localGroupmessage);
      console.log(localGroupmessages);
  if(localGroupmessages.length!=0){
   console.log("backend is called for "+grouptitle);
  let lastmessageId = localGroupmessages[localGroupmessages.length-1].Id;
  let groups = JSON.parse(localStorage.getItem('Allgroups'));
  groups.forEach(group=>{
   if(group.GroupName===grouptitle){
     groupId= group.id;
   }
  })

  console.log("last message Id = "+lastmessageId);
   console.log("group Id = "+groupId);
  let messageData = await getmessagesApi(groupId,lastmessageId);
  console.log(messageData);
  if(messageData.length>0) {
   console.log('new message arrived')
    let UpdatelocalData = JSON.parse(localStorage.getItem(grouptitle));
     messageData.forEach(message=>{
       UpdatelocalData.push(message);
     })
     
    if(UpdatelocalData.length>30) {
       while(UpdatelocalData.length>30){
         UpdatelocalData.shift();
       }
    }

     localStorage.setItem(grouptitle,JSON.stringify(UpdatelocalData));
     assembleData(messageData);
  }
  else{
    return;
   }
  }
 }
  else{
   let groups = JSON.parse(localStorage.getItem('Allgroups'));
   groups.forEach(group=>{
    if(group.GroupName===grouptitle){
      groupId= group.id;
    }
   })
   console.log(groupId);
  let firstmessageData = await getmessagesApi(groupId,0);
  console.log(firstmessageData);
  if(firstmessageData.length>0){
   localStorage.setItem(grouptitle,JSON.stringify(firstmessageData));
   assembleData(firstmessageData);
    }
 }
}

async function assembleData(Groupmessages){
  try{
    Groupmessages.forEach(Element => {
    let hour = Number(Element.createdAt.substring(11,13))+5;
    let AmorPm = "AM";
    if(hour>12){
      hour = hour-12
      AmorPm = "PM"
    }
    let minutes = Element.createdAt.substring(14,16);
    minutes = Number(minutes)+30;
    if(minutes>60) {
       minutes=Number(minutes)-60;
       if(minutes==0){
        minutes="00";
       }
       hour=Number(hour)+1;
       if(hour>12){
         hour=1;
       }
       
    }

    if(hour>=1 && hour<=9){
      hour = `0${hour}`
    }


    let myobj = {
      Message : Element.Message,
      Username : Element.user.Username,
      Date : Element.createdAt.substring(0,10).split("-").reverse().join('/'),
      Time : `${hour}:${minutes} ${AmorPm}`
    }

        let address = Element.Message.split('/');

        if(address){
          if(address[2]==='groupchat-userfiles.s3.amazonaws.com'){
            let filetype = Element.Message.split('.')[4];
          console.log(filetype);
          if(filetype==='jpg' || filetype==='png' || filetype==='jpeg' || filetype==='gif'){
              console.log("image file !!!");
              showfilesOnchatingterminal(myobj,true,filetype);  // true : because it is image file
          }
          else{
              showfilesOnchatingterminal(myobj,false,filetype);
           }
          }
          else{
            ShowOnChatTerminal(myobj);
          }
        }
        else{
          ShowOnChatTerminal(myobj);
        }
   });
  }
  catch(err){
    console.log(err);
    alert("error occured")
    return err
   }

 }


let MessageList = document.querySelector('#messagelist');

async function ShowOnChatTerminal(obj){
   
  let p = document.createElement('p');
  let date = document.createElement('date');
  date.id = "date";
  let br1 = document.createElement('br');
  let br2 = document.createElement('br');
  let name = document.createElement('name');
  let message = document.createElement('message');
  let time = document.createElement('time');
  let hr = document.createElement('hr');
  
  date.textContent = obj.Date;
  p.appendChild(date);
  p.appendChild(br2);
  name.textContent = `${obj.Username} : `;
  if(localStorage.getItem('Username') === obj.Username ){
    name.textContent = 'YOU : '
    p.style.textAlign="end"
  }
  else{
    p.style.textAlign="start"
  }
  p.appendChild(name);
  message.textContent = `${obj.Message} `;
  p.appendChild(message);
  
  time.textContent = obj.Time;
  p.appendChild(br1);
  p.appendChild(time);
  MessageList.appendChild(p);

  document.querySelector('#chattingTerminal').scrollTo(0, document.querySelector('#chattingTerminal').scrollHeight || document.documentElement.scrollHeight);
  // document.querySelector('#chattingTerminal').scrollTop = document.querySelector('#chattingTerminal').scrollHeight
}

// group info 

let addmembersbtn = document.querySelector('#addmembersbtn');
let groupinfoBtn = document.querySelector('#groupinfobtn');
let groupinfoclosebtn = document.querySelector('#infopageclose');
let infopage = document.querySelector('#groupinfopage');

groupinfoBtn.addEventListener('click',()=>{
  infopage.style.display='block';
})

groupinfoclosebtn.addEventListener('click',()=>{
  infopage.style.display='none';
  document.querySelector('#addmemberspage').style.display='none';
  addmembersbtn.textContent='Add members'
})

// addmemberspage

let memberspage = document.querySelector('#addmemberspage');

addmembersbtn.addEventListener('click',()=>{
  if(addmembersbtn.textContent==='Close'){
    let selectElements = document.getElementById("selectmember");
    $(selectElements).selectpicker('refresh');
  }
  if(addmembersbtn.textContent==='Add members'){
    memberspage.style.display='block';
    addmembersbtn.textContent='Close';

  }
  else{
    memberspage.style.display='none';
    addmembersbtn.textContent='Add members';
  }
})

let infoBtn = document.querySelector('#groupinfobtn');

var totalusers;
infoBtn.addEventListener('click',async()=>{
  let token = localStorage.getItem('Token');
  let response = await axios.get('http://localhost:8000/group/getallmembers',{ headers : {'authorization' : token} })
  let Allusers = response.data.Allusers
  totalusers = Allusers;
  console.log(Allusers);
  
  addTomemberList(Allusers);
  getAllgroupmembers();
})

let counting = 0;
var allmembers;

function addTomemberList(Allusers) {
  console.log(Allusers);
  if(counting>0){
    return;
  }
  let selectElements = document.getElementById("selectmember");
  console.log(selectElements);
  Allusers.forEach(Element=>{
    let option = document.createElement('option');
    option.textContent = Element.Username
    selectElements.appendChild(option);
  })
    $(selectElements).selectpicker('refresh');
  counting++;
}

//getting all group members while clicking group info button

var GroupMembers;
let clickcount=0;
async function getAllgroupmembers(){
  groupmembersList.textContent='';
  let token = localStorage.getItem('Token');
  console.log(grouptitle);
  let Allgroups = JSON.parse(localStorage.getItem("Allgroups"));
  let thisgroupId;
  Allgroups.forEach(group=>{
    if(group.GroupName===grouptitle){
       thisgroupId = group.id;
    }
  })

  console.log("groupId "+thisgroupId);

  let response = await axios.get(`http://localhost:8000/group/getgroupmembers/${thisgroupId}`,{headers : {'authorization' : token }});
  console.log(response);
  GroupMembers = response.data.groupmembers;
  displaymembers(response.data.groupmembers);
}

let groupmembersList = document.querySelector('#memberslist');

async function displaymembers(groupmembers){
  try{
    console.log(groupmembers);
    let thisuser = String(localStorage.getItem('Username'));
    let thisuserIsAdmin=false;
  
    groupmembers.forEach(member=>{
      console.log(member);
      if(member.isAdmin===true){
         if(member.user.Username===thisuser){
           thisuserIsAdmin=true;
         }
      }
    })
  
    console.log(thisuser);
    console.log(thisuserIsAdmin);
  
    groupmembers.forEach(member=>{
      let username = member.user.Username;
      let isAdmin = member.isAdmin;
      if(username===thisuser){
        username="YOU"
      }
      let tr = document.createElement('tr');
      let td1 = document.createElement('td');
      let td2 = document.createElement('td');
      let td3 = document.createElement('td');
      let h2 = document.createElement('h2');
      h2.id = 'member';
      if(isAdmin===true){
        h2.textContent=`${username} (Admin) `
      }
      else{
        h2.textContent=`${username} `
      }
      td1.appendChild(h2);
      let button = document.createElement('button');
        button.id='removeuser'
        button.className='btn btn-danger'
        button.textContent="remove";
        if(username==='YOU'){
          button.textContent='Exit'
        }
        td2.appendChild(button);
        tr.appendChild(td1);
        tr.appendChild(td2);
        
        if(thisuserIsAdmin && !isAdmin){
         var Markadmimbtn = document.createElement('button');
          Markadmimbtn.id = 'markasadminbtn';
          Markadmimbtn.className='btn btn-info'
          Markadmimbtn.textContent='Make as Admin';
          td3.appendChild(Markadmimbtn);
          tr.appendChild(td3);
        }
        groupmembersList.appendChild(tr);
        
      button.addEventListener('click',async()=>{
        let text = "Are you sure do you want to remove user ?";
        if(button.textContent==='Exit'){
          text = "Are you sure Do you want to Exit from this group ? "
        }
        if(confirm(text)) {
            try{
            console.log(member);
          
            var token = localStorage.getItem('Token');
            let response = await axios.post('http://localhost:8000/group/removemember',member,{ headers : {'authorization' : token,"clarification" : button.textContent} });
            console.log(response);
            alert(response.data.message);
            if(response.data.message==='User removed from this group successfully' || response.data.message==='Exited from this group successfully'){
              groupmembersList.removeChild(tr);
              infoBtn.click();
            }
          }
          catch(err){
            console.log(err);
            alert(err.response.data.message);
           }
          }
      })
      if(thisuserIsAdmin && !isAdmin){
      Markadmimbtn.addEventListener('click',async()=>{
        try{
        let token = localStorage.getItem('Token');

        if(confirm('Are you sure ?')){
          let response = await axios.post('http://localhost:8000/group/makeasadmin',member,{headers : {'authorization' : token}});
          console.log(response); 
          alert(response.data.message);
          if(response.data.message==='Marked as admin successfully'){
            infoBtn.click();
          }
        }
      }
      catch(err){
        console.log(err);
        alert(err.response.data.message);
      }
      })
    }
    })
  }
  catch(err){
    console.log(err);
  }
}


// adding extra members in group

let addmembersform = document.querySelector('#addmembersform');

addmembersform.onsubmit = addextraMember

async function addextraMember(e){
  try{
    e.preventDefault();
    
    let selectedValues = [];
    let selectElement = document.getElementById("selectmember");
    for (var i = 0; i < selectElement.options.length; i++) {
      let option = selectElement.options[i];
      if (option.selected) {
        selectedValues.push(option.value || option.text);
      }
    }
  
    let selectedValuesaddedwithId = [];
    console.log(selectedValues);
    let groups = JSON.parse(localStorage.getItem('Allgroups'));
    let thisgroupId;
    groups.forEach(group=>{
      if(grouptitle === group.GroupName){
        thisgroupId = group.id;
      }
    })
    totalusers.forEach(user=>{
      selectedValues.forEach(username=>{
         if(user.Username === username ){
             let obj = {
                userId : user.Id,
                groupId : thisgroupId,
                username : username
             }
             selectedValuesaddedwithId.push(obj);
         }
      })
    })
    console.log(selectedValuesaddedwithId);
    console.log(GroupMembers)
    let count=0;
    GroupMembers.forEach(member=>{
      selectedValuesaddedwithId.forEach(user=>{
        if(member.user.Username===user.username){
          count++;
        }
      })
    })
    if(count>0){
      alert('One of the selected users is already Exists please select members who not a member of this group');
    }
    else{
      let token = localStorage.getItem('Token');
      let response = await axios.post('http://localhost:8000/group/addmembers',selectedValuesaddedwithId,{headers : {'authorization' : token }});
      console.log(response);
      alert(response.data.message);
      if(response.data.message==='user successfully added'){
       infoBtn.click();
       document.querySelector('#addmembersbtn').click();
      }
    }
  }
  catch(err){
    console.log(err);
    alert('some error occured');
    alert(err.response.data.message);
  }
}

// delete group

let deletegroupBtn = document.querySelector('#deletegroupbtn');

deletegroupBtn.addEventListener('click',async()=>{
  try{
    console.log(grouptitle);
    if(confirm(`Are you sure ? Do you want to delete ${grouptitle} group ? `)){
      let Allgroups = JSON.parse(localStorage.getItem('Allgroups'));
      let groupId;
      Allgroups.forEach(group=>{
       if(group.GroupName===grouptitle){
          groupId = group.id
        }
      })
      let token = localStorage.getItem('Token');
      let response = await axios.get(`http://localhost:8000/group/deletegroup/${groupId}`,{headers : {'authorization' : token}});
      console.log(response); 
      alert(response.data.message);
      if(response.data.message==='group deleted succesfully'){
        document.querySelector('#refreshgroup').click();
        location.reload();
        localStorage.removeItem(grouptitle);
      }
    }
  }
  catch(err){
    console.log(err);
    alert(err.response.data.message);
  }
})


/// file sharing

let clip = document.querySelector('#clip');
let sendfileform = document.querySelector('#fileform');
let sendfileBtn = document.querySelector('#sendfilebtn');
let fileinput = document.querySelector('#fileinput');
let pleasewait = document.querySelector('#pleasewait');

sendfileform.onsubmit = uploadFile;

let clipclickcount = false;

clip.addEventListener('click',()=>{
  if(clipclickcount===false){
    sendfileform.style.display='block';
    clipclickcount=true;
  }
  else if(clipclickcount===true){
    sendfileform.style.display='none';
    clipclickcount=false;
  }
})

sendfileBtn.addEventListener('click',()=>{
  pleasewait.style.display='block';
})

socket.on('receive-a-file',(file)=>{
  console.log(file);
  assembleData([file[0]]);
})

async function uploadFile(e){
  try{
    e.preventDefault();
    let file = fileinput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    let token = localStorage.getItem('Token');
    let groupId;
    let Allgroups = JSON.parse(localStorage.getItem('Allgroups'));
    Allgroups.forEach((group)=>{
      if(group.GroupName===grouptitle){
         groupId = group.id;
      }
    })
    let response = await axios.post('http://localhost:8000/messages/sendfile',formData,{headers : {"authorization" : token , "groupId" : groupId }});
    console.log(response);
    if(response){
      sendfileform.style.display='none';
      fileinput.value='';
      pleasewait.style.display='none';
      console.log(response.data.file);
      socket.emit('someone-sent-a-file',response.data.file,grouptitle);
    }
  }
  catch(err){
    console.log(err);
    pleasewait.style.display='none';
    alert('some error occured');
  }
}

var Icons = {
  person : "bi bi-person" ,
  downloadIcon : "bi bi-download",
  pdf : "bi bi-filetype-pdf" ,
  csv : "bi bi-filetype-csv",
  xlsx : "bi bi-filetype-xlsx" ,
  txt :  "bi bi-filetype-txt",
  wav : "bi bi-filetype-wav" ,
  image : "bi bi-file-image" ,
  zip :   "bi bi-file-zip-fill" ,
  aac  : "bi bi-filetype-aac" ,
  pptx : "bi bi-filetype-pptx" ,
  docx : "bi bi-filetype-docx" ,
  doc :  "bi bi-filetype-doc",
  mov : "bi bi-filetype-mov" ,
  mp4 :  "bi bi-filetype-mp4" ,
  mp3 : "bi bi-filetype-mp3" ,
  other :  "bi bi-files",
};

function giveIconclass(icon){
  console.log(icon);
  return Icons[icon];
}

async function showfilesOnchatingterminal(fileDetails,Isimage,filetype){
  console.log(fileDetails);
  let p = document.createElement('p');
  let date = document.createElement('date');
  date.id = "date";
  let br1 = document.createElement('br');
  let br2 = document.createElement('br');
  let br3 = document.createElement('br');
  let name = document.createElement('name');
  let message = document.createElement('message');
  let time = document.createElement('time');
  let hr = document.createElement('hr');
  
  
  if(Isimage){
    let imgTag= document.createElement('img');
    let Dwnbutton = document.createElement('button');
    var Iconwithclass;
    Dwnbutton.className = 'btn btn-warning'
    Dwnbutton.id = "imagedownloadBtn";
    Dwnbutton.textContent = 'Download';
    Dwnbutton.style.fontSize = 'small';
    imgTag.id = 'imageTag';
    imgTag.src = fileDetails.Message;
    imgTag.alt = "loading failed"
    imgTag.setAttribute('width', '450');
    imgTag.setAttribute('height', '350');
    date.textContent =`${fileDetails.Date} : `;
    p.appendChild(date);
    if(localStorage.getItem('Username') === fileDetails.Username ){
      name.textContent = 'YOU '
      p.style.textAlign="end"
    }
    else{
      p.style.textAlign="start"
      name.textContent = ` ${fileDetails.Username} `;
    }
    p.appendChild(name);
    p.appendChild(br1);
    p.appendChild(imgTag);
    p.appendChild(br2);
    p.appendChild(Dwnbutton);
    p.appendChild(br3);
    time.textContent = fileDetails.Time;
    p.appendChild(time);

    Dwnbutton.addEventListener('click',()=>{
      var a = document.querySelector('a');
      a.href =fileDetails.Message;
      a.click();
    })
  }

  else{
    console.log("none image file");
    if(filetype==="pdf"){
     Iconwithclass  = giveIconclass("pdf")
    }
    else if (filetype==="mp3"){
      Iconwithclass  = giveIconclass("mp3")
    }
    else if (filetype==="xlsx"){
      Iconwithclass  = giveIconclass("xlsx")
    }
    else if (filetype==="txt"){
      Iconwithclass  = giveIconclass("txt")
    }
    else if (filetype==="wav"){
      Iconwithclass  = giveIconclass("wav")
    }
    else if (filetype==="docx"){
      Iconwithclass  = giveIconclass("docx")
    }
    else if (filetype==="doc"){
      Iconwithclass  = giveIconclass("doc")
    }
    else if (filetype==="pptx"){
      Iconwithclass  = giveIconclass("pptx")
    }
    else if (filetype==="aac"){
      Iconwithclass  = giveIconclass("aac")
    }
    else if (filetype==="mov"){
      Iconwithclass  = giveIconclass("mov")
    }
    else if (filetype==="zip"){
      Iconwithclass  = giveIconclass("zip")
    }
    else if (filetype==="mp4"){
      Iconwithclass  = giveIconclass("mp4")
    }
    else if (filetype==="csv"){
      Iconwithclass  = giveIconclass("csv")
    }
    else{
      "other"
      Iconwithclass  = giveIconclass("other")
    }
    
    console.log(Iconwithclass);
    
    date.textContent =`${fileDetails.Date} `;
    p.appendChild(date);
    if(localStorage.getItem('Username') === fileDetails.Username ){
      name.textContent = ' : YOU '
      p.style.textAlign="end"
    }
    else{
      p.style.textAlign="start"
      name.textContent = ` : ${fileDetails.Username} `;
    }
    p.appendChild(name);
    p.appendChild(br1);

    let i = document.createElement('i');
    let filename = document.createElement('h4');
    let Thisfilename = fileDetails.Message.split("--")[2];
    console.log(Thisfilename);
    i.className = Iconwithclass;
    i.id='Icon';
    p.appendChild(i);
    filename.textContent = Thisfilename;
    filename.id = 'filename';
    filename.style.display='inline'
    p.appendChild(filename);
    let downloadIcon = document.createElement("i");
    downloadIcon.className =  "bi bi-download";
    downloadIcon.id = 'downloadIcon';
    p.appendChild(downloadIcon);
    p.appendChild(br2);
    time.textContent = ` ${fileDetails.Time} `;
    p.appendChild(time);
    downloadIcon.addEventListener('click',()=>{
      let a = document.querySelector('a');
      a.href =fileDetails.Message;
      a.click();
    })
  }

    MessageList.appendChild(p);

    document.querySelector('#chattingTerminal').scrollTo(0, document.querySelector('#chattingTerminal').scrollHeight || document.documentElement.scrollHeight);

    // document.querySelector('#chattingTerminal').scrollTop = document.querySelector('#chattingTerminal').scrollHeight
  }

