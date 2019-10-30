let uploadzone = Vue.component('upload-zone', {
	template: '#upload-zone-template',
	data: function() {
		return {
			http: undefined,
			progress: 0,
			files: [],
			posturl: "",
		};
	},
	created: function() {
		this.xhr = new XMLHttpRequest();

		this.xhr.onreadystatechange = () => {
			if (this.xhr.readyState === XMLHttpRequest.DONE) {
				if (this.xhr.status >= 200 && this.xhr.status <= 299) {
					console.log("[+] upload completed");
					return;
				}
				throw new Error(`server error: ${this.xhr.responseText}`);
			}
		};

		this.xhr.onerror = (e) => { throw new Error(e); };

		this.xhr.upload.addEventListener('progress', (e) => {
			this.progress = Math.round((e.loaded / e.total) * 100);
		}, false);
	},
	mounted: function() {
		this.listenForFileDrops();
	},
	methods: {
		upload: function(file) {
			this.xhr.open("POST", "/upload_url", false);
			this.xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			this.xhr.send("file=" + file.name);

			var data = JSON.parse(this.xhr.responseText);

			var formdata = new FormData();
			Object.keys(data.fields).forEach(k => { formdata.set(k, data.fields[k]) });
			formdata.set('acl', 'public-read');
			formdata.set('Content-Type', 'image/png');
			formdata.append('file', file, "files/" + file.name);

			this.xhr.open('POST', data.url, true);
			this.xhr.send(formdata);
		},
		listenForFileDrops: function() {
			let dropzone = document.getElementById("upload-zone");
			dropzone.addEventListener("dragenter", this.dragEnter, false);
			dropzone.addEventListener("dragover", this.dragOver, false);
			dropzone.addEventListener("drop", this.drop, false);
		},
		drop: function(e) {
			e.stopPropagation();
			e.preventDefault();

			[...e.dataTransfer.files].forEach(f => this.upload(f));
		},
		dragEnter: function(e) {
			e.stopPropagation();
			e.preventDefault();
		},
		dragOver: function(e) {
			e.stopPropagation();
			e.preventDefault();
		}
	}
});

let Hauler = new Vue({
	el: '#hauler-app',
	components: [uploadzone],
	created: function() {
		console.log('[~] Initializing...');
	},
	mounted: function() {
		console.log("[+] Loaded.");
	}
});
