<?php
$servername = "localhost";
$username = "kopefw_machinal";
$password = "KopeConejo2018";
$db = "kopefw_machinalScore";
// Create connection
$conn = new mysqli($servername, $username, $password, $db);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 
//echo "Connected successfully";

 if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre =  $_POST["nombre"]; 
    $score =  $_POST["score"]; 
    $sql = "INSERT INTO scores (nombre, score) VALUES ('$nombre', '$score')";

    $conn->query($sql);
     
 }else{
     $sql = "SELECT * FROM scores ORDER BY score DESC";
     $result = $conn->query($sql);

    if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
        echo $row["nombre"]. " " . $row["score"] . " ";
    }
    } else {
    echo "0 results";
    }    
 }





$conn->close();

?>