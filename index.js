'use strict';
require('dotenv').load();
const BUCKET = process.env.BUCKET;
const URL = process.env.URL;
const AWS = require('aws-sdk');
AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_KEY});
AWS.config.update({region: 'us-east-1'}); 
const S3 = new AWS.S3({
  signatureVersion: 'v4',
  Bucket: BUCKET
});
const Sharp = require('sharp');
const http = require('http');
const fs = require('fs');
const express = require('express');
const app = express();
const router = express.Router();
var types = [];
types['gif'] = 'image/gif';
types['jpg'] = 'image/jpg';
types['jpeg'] = 'image/jpeg';
types['png'] = 'image/png';
//types['svg'] = 'image/svg+xml';
types['bmp'] = 'image/bmp';


module.exports.resize = function(file, res, w, h){
	w = w || null;
	h = h || null;
	var ext = file.split('.').pop();
	console.log(ext);
	S3.getObject({Bucket: BUCKET, Key: file}, function(err, data){		
		if(err)
			console.log(err);	
		let content_type = data.ContentType;
		if(types[ext])
			content_type = types[ext];
		console.log(content_type);
		if((w>0 || h>0) && content_type.indexOf('svg')<=0)
		{		
			Sharp(data.Body).resize(w, h).max().toBuffer(function(err, data){			 
				res.writeHead(200, {'Content-Type': content_type});
				res.end(data);  				
			}); 
		} 
		else{			
			res.writeHead(200, {'Content-Type': content_type});
			res.end(data.Body);  			
		}		 
	});	
	
}

router.get("/", function(req, res) {
	let width = parseInt(req.query.w) || 0; 
	let height = parseInt(req.query.h) || 0; 
	let file = req.query.f;
	module.exports.resize(file, res, width, height);	
});


app.use('/', router);

 // Start the server listening
 var server = app.listen(8124, function() {
		
 });					



