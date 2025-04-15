<?php

$imgData = $_POST['imgUri'];
$imgData = str_replace(' ','+',$imgData);
$imgData =  substr($imgData,strpos($imgData,",")+1);
$imgData = base64_decode($imgData);
// Path where the image is going to be saved
$uid = uniqid();
$filePath = './images/charts/'.$uid.'.png';
// Write $imgData into the image file
$file = fopen($filePath, 'w');
fwrite($file, $imgData);
fclose($file);
echo $uid;

?>