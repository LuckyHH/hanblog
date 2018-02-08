		var check_pwd = function(){
			var input_pwd = document.getElementsByTagName('input');
			var message = document.getElementById('message');
			var length = input_pwd.length;
			for (var i = 0; i < length; i++) {
				if(input_pwd[i].value) continue;
				else{
					message.innerHTML = "密码输入不规范";
					message.style.display = "block";
					return false;
				}
			}
			if (input_pwd[1].value !== input_pwd[2].value) {
				message.innerHTML = "两次密码输入不一样";
				message.style.display = "block";
				return false;
			}
			message.style.display = "none";
			return true;
		}
		var submit_item = function(e){
			var e = EventUtil.getEvent(e);
			if (!check_pwd()) {
				EventUtil.preventDefault(e);
			}
		}
		var isubmit = document.getElementById('isubmit');
		isubmit.onclick = submit_item;