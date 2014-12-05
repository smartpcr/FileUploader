/**
 * Created by sp_farm on 12/4/2014.
 */

'use strict';

var fileApi = fileApi || {};
fileApi.canHandleFileReader = false;
fileApi.reader = null;
fileApi.progress = null;
fileApi.check = function () {
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		console.log("OK");
		fileApi.canHandleFileReader = true;
	}
	else {
		console.warn("File API is not supported in browser!");
		fileApi.canHandleFileReader = false;
	}
};

fileApi.handleFileSelect = function (evt) {
	evt.stopPropagation();
	evt.preventDefault();

	fileApi.progress = $('#progress_bar');
	fileApi.progress.css('width:0%');
	fileApi.progress.text('0%');
	fileApi.reader = new FileReader();
	fileApi.reader.onerror = fileApi.errorHandler;
	fileApi.reader.onprogress = fileApi.updateProgress;
	fileApi.reader.onabort = function(e){
		console.warn('aborted');
	};
	fileApi.reader.onloadstart = function(e){
		console.log('started');
	};
	fileApi.reader.onload = function(e){
		fileApi.progress = $('#progress_bar');
		fileApi.progress.css('width:100%');
		fileApi.progress.text('100%');

		setTimeout(function(){
			fileApi.progress = $('#progress_bar');
			fileApi.progress.className='';
		}, 2000);
	};

	var files = evt.dataTransfer.files;
	var output = [];
	for(var i= 0, f; f=files[i]; i++){
		var html = '<li><stong>{0}</stong> ({1}) - {2} bytes, last modified: {3}</li>';
		html = html.replace('{0}', f.name);
		html = html.replace('{1}', f.type || 'n/a');
		html = html.replace('{2}', f.size);
		html = html.replace('{3}', f.lastModifiedDate? f.lastModifiedDate.toLocaleDateString() : 'n/a');
		output.push(html);

		fileApi.reader.readAsDataURL(f);
	}
	$('#list').append('<ul>' + output.join('\n') + '</ul>');
};

fileApi.handleDragOver = function(evt){
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy';
};

fileApi.abortRead = function(){
	if(fileApi.reader){
		fileApi.reader.abort();
	}
};

fileApi.errorHandler = function(evt){
	console.error(evt.target.error);
};

fileApi.updateProgress = function(evt){
	if(evt.lengthComputable){
		var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
		if(percentLoaded<100){
			fileApi.progress = $('#progress_bar');
			fileApi.progress.css('width: ' + percentLoaded + '%');
			fileApi.progress.text(percentLoaded + '%');
		}
		else {
			fileApi.progress = $('#progress_bar');
			fileApi.progress.css('width: 99%');
			fileApi.progress.text('99%');
		}
	}
};

$(document).ready(function(){
	fileApi.check();

	if(fileApi.canHandleFileReader){
		var dropZone = document.getElementById('drop_zone');
		dropZone.addEventListener('dragover', fileApi.handleDragOver, false);
		dropZone.addEventListener('drop', fileApi.handleFileSelect, false);
		// $(dropZone).on('drop', fileApi.handleFileSelect);
		//var fileBrowser = document.getElementById('files');
		//fileBrowser.addEventListener('change', fileApi.handleFileSelect, false);
	}

	return fileApi;
});
