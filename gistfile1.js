#!/usr/bin/env node

var fs = require('fs');
var http = require('http');
var url = require('url');

var mysql = require('mysql');

var db = mysql.createConnection({/*connect to some database here!*/});
//do not connect
/*
db.connect();
*/

//log some unfortunate errors
process.on('uncaughtException', function (err) {
    console.log(err);
});

var template = function(vars, callback) {
    fs.readFile('./base.html', 'utf8' , function(err, data) {
	if (err) {
	    return console.log(err); /*exit gracefully is an error occurs*/
	}
	
        c = 0;

	console.log("Template() data: %s", data);
	console.log("Template() vars: %s", vars);
	console.log(JSON.stringify(vars));
	
        Object.keys(vars).forEach(function(k){
	    console.log("forEach");
	    console.log(k);
	    console.log(JSON.stringify(k));
            data.replace('{{'+k+'}}', vars[k]);
	    console.log("Templtate() c: %s", c);
            if(++c === vars.length) callback(data);
        })
    });
}

console.log("Starting the server!");
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    var params = url.parse(req.url, true).query;

    //console.log("xxxxxxxxxxxxxxxxxHere are the params %s", params);
    
    console.log("req.url:%s", req.url);
    if (req.url === '/') {
	console.log("1");
        fs.readFile('./index.html', function(err, data){
	    if (err) {
		return console.log(error);
	    }
	    console.log("Req Root() data:");
	    console.log(JSON.stringify(data));
            template({ content: data }, function(html){
                res.end(html);
            });
        });
    } else if (req.url === '/db') {
	console.log("DBDBDBDBDBDBDBD DBDBDBDBDBDBDBD DBDBDBDBDBDBDBD DBDBDBDBDBDBDBD DBDBDBDBDBDBDBD");
        db.query('select * from users where name = "' + params.name + '" LIMIT 1;', function(err, rows, field){
            fs.readFile('./index.html', function(err, data){ 
                template({ content: data, rows: rows }, function(html){
		    console.log("yyyyyyyyyyy" + html);
                    res.end(html);
                });
            })
        })
    } else if (req.url === '/remote') {
	console.log("remoteremoteremoteremoteremoteremoteremoteremoteremoteremoteremote");
	http.request(params, function(response){
            var str = '';
            response.on('data', function(chunk){
                str += chunk;
            });
            response.on('end', function(){
                res.end(str);
            })
        });
    } else {
        fs.readFile('./' + req.url, function(err, data){
            template({ content: data, input: params.input }, function(html){
                res.end(html);
            });
        });  
    }
}).listen(3000);
console.log('Server running at http://127.0.0.1:3000/');
