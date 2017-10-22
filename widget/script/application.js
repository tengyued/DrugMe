// 对话界面js

(function() {
    // Global
    var USER_ICON = "image/user_icon.jpg";
    var USER_ALT = "用户头像";
    var FAW_ICON = "image/faw_vw.png";
    var FAW_ALT = "一汽大众机器人头像";
    var WEBSITE = "http://10.220.40.197:8080/Web_Pro/ServerAgent";
    var speechRecognizer;
    var screeny;
    var content;


    window.onload = function() {
        var send = document.getElementById("send");

        send.addEventListener('touchstart', touch, false);
        send.addEventListener('touchmove',touch, false);  
        send.addEventListener('touchend',touch, false);
    
        // To initial greeting
        sleep(2000);
        sendWeb(" &flag=1");            
    }


    function sleep(numberMillis) {
        var now = new Date();
        var exitTime = now.getTime() + numberMillis;
        while (true) {
            now = new Date();
            if (now.getTime() > exitTime)
            return;
        }
    }

    function touch(event){
        var event = event || window.event;
        var next = document.getElementsByClassName("next")[0];
        var height = window.screen.height - 100;
        var rec2 = document.getElementById("rec2");

        switch(event.type){
            case "touchstart":
                startRecord();
                break;
            case "touchend":
                // Button color init
                var send = document.getElementById("send");
                send.classList.add("button_off");
                send.classList.remove("button_on");

                rec2.style.background = "transparent";
                rec2.innerHTML = "手指上划，取消发送";

                // Hide recording icon
                var rec = document.getElementById("recording");
                rec.style.display = "none";

                speechRecognizer.stopRecord();

                if (screeny < height) {
                    cancelRec();
                } else {
                    endRecord();
                }
                screeny = height;

                break;
            case "touchmove":
                // If half way out of the button, show change #rec2
                var rec2 = document.getElementById("rec2");
                screeny = event.touches[0].screenY;
                
                if (screeny < height) {
                    // change
                    rec2.style.background = "red";
                    rec2.innerHTML = "松开手指，取消发送";
                } else {
                    // change back
                    rec2.style.background = "transparent";
                    rec2.innerHTML = "手指上划，取消发送";
                }
                break;
        }
    }

    function endRecord() {
        // Stop recording
        var next = document.getElementsByClassName("next")[0];
        speechRecognizer.stopRecord();
        // var input = content;
        // next.innerHTML = "";
        submit();
        // submit(input);
    }

    function cancelRec() {
        var next = document.getElementsByClassName("next")[0];
        speechRecognizer.cancelRecord();
        // next.innerHTML = "";
        content = "";
    }


    // Start the transition, save the words into the hidden div
    function startRecord() {
        // Demonstration modification
        var send = document.getElementById("send");
        send.classList.add("button_on");
        send.classList.remove("button_off");
        var next = document.getElementsByClassName("next")[0];

        // Recording icon
        var rec = document.getElementById("recording");
        rec.style.display = "inline-block";

        speechRecognizer = api.require('speechRecognizer');

        // Recording SDK
        speechRecognizer.record({
            vadbos: 5000,
            vadeos: 5000,
            rate: 16000,
            asrptt: 1,
            audioPath: 'fs://speechRecogniser/speech.mp3'
        }, function(ret, err) {
            if (ret.status) {
                content = ret.wordStr;
                // alert("content: " + content);
            } else {
            }
        });

        
    }

    // Submit the user input, update it to the screen,
    //   and send it to the server
    function submit() {
        // // Get the input and send request
        // var textarea = document.getElementById("input");
        // var received = textarea.value;
        var received = content;
        content = "";

        // alert("|" + received + "|");
        
        if(typeof(received) != "undefined" && 
            received != "" && received != "。" && received != " ") {
            // update the screen
            input = received.split("\n").join("<br />");

            var next = document.getElementsByClassName("next");
            next = next[0];
            next.classList.remove("next");
            next.classList.add("user");

            var span = document.createElement("span");
            span.innerHTML = input;
            next.appendChild(span);

            var img = document.createElement("img");
            img.classList.add("icon");
            img.setAttribute("src", USER_ICON);
            img.setAttribute("alt", USER_ALT);
            next.appendChild(img);

            setNext();
            // textarea.value = "";

            sendWeb(received);
        }
    }

    // Set the space and focus on it
    function setNext() {
        var showboard = document.getElementById("showboard");
        var next = document.createElement("div");
        next.classList.add("next");
        showboard.appendChild(next);
        next.scrollIntoView();
    }

    // Send Ajax Request
    function sendWeb(input) {
        // console.info(WEBSITE + "?question=" + input)
        // $.ajax({
        //     url:WEBSITE + "?question=" + input,
        //     type:'GET',
        //     contentType:"text/html;charset=utf-8",
        //     success:function(data) {
        //         console.info("data",data);
        //         alert(123);
        //     },
        //     error:function(data){
        //         console.info("data",data)
        //         alert(1);
        //     }
        // })
        var xml = new XMLHttpRequest();
        xml.onload = robotInfo;
        xml.open('GET', WEBSITE + "?question=" + input, true);
        xml.send();
    }
    
    // Get the server given data
    function robotInfo() {
        if (this.status != 200) {
            robotInput("抱歉，您的网络中断，请刷新后重试");
        } else {
            var input = this.responseText;
            robotInput(input);
        }
    }

    // Formulate the given info
    function robotInput(string) {
        var showboard = document.getElementById("showboard");
        var next = document.getElementsByClassName("next");
        next = next[0];
        next.classList.remove("next");
        next.classList.add("robot");

        var img = document.createElement("img");
        img.classList.add("icon");
        img.setAttribute("src", FAW_ICON);
        img.setAttribute("alt", FAW_ALT);
        next.appendChild(img);

        
        
        if (string.indexOf("image:") == -1) {
            // If string
            var span = document.createElement("span");
            string = string.split("\n").join("<br />")
            span.innerHTML = string;
            next.appendChild(span);
        } else {
            // If image
            var address = string.slice(6);
            address = "image/" + address;
//            span.innerHTML = address;

            // alert("image address: " + address);
            var pic = document.createElement("img");
            pic.classList.add("image");
            pic.setAttribute("src", address);
            pic.setAttribute("alt", "示意图，可以点击打开");
            next.appendChild(pic);
            pic.onclick = picClick;
        }  
        
//        string = string.split("\n").join("<br />")
//        span.innerHTML = string;

        setNext();
    }
    
    // Change open to navigate according to app
    function picClick() {
        // window.open(this.getAttribute("src"));
        var photos = document.getElementById("photos");
        var image = document.querySelector("#photos img");
        var bottom = document.getElementById("bottom_bar");
        image.setAttribute("src", this.getAttribute("src"));
        bottom.style.display = "none";

        photos.style.display = "block";
        photos.onclick = function() {
            photos.style.display = "none";
            bottom.style.display = "block";
        }
        // window.navigate(this.getAttribute("src")); 
    }
}) ();