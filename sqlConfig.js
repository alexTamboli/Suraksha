const express = require("express");
const mysql = require("mysql");

const pool = mysql.createPool({
	connectionLimit: 20,

	host: "localhost",
	user: "sqluser",
	password: "password",
	database: "suraksha"
	
	// host: "sql6.freemysqlhosting.net",
	// user: "sql6483991",
	// password: "CE8EGafMbi",
	// database: "sql6483991"
}); 

exports.getConnection = function() {
	pool.getConnection(function(err, conn) {
		if(err) {
			conn.release();
			console.log(err);
		}
		console.log("Connected");
		conn.query("SELECT * FROM suraksha", function(err, rows, field){
			conn.release();
			if(err) console.log(err);
		})
	});
}

exports.runQuery = function(query, fn) {
	pool.getConnection(function(err, conn) {
		if(err) {
			conn.release();
			console.log(err);
		}
		conn.query(query, function(err, result, field){
			conn.release();
			if(err) console.log(err);
			fn(result);
		})
	})
}

exports.getDate = function() {

  const today = new Date();

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  return today.toLocaleDateString("en-US", options);

};