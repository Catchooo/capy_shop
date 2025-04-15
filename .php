<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"];
    $message = $_POST["message"];
    $to = "br.m.airways@gmail.com"; // Замініть на свою пошту
    $subject = "Нове повідомлення з сайту";
    $body = "Від: " . $email . "\r\nПовідомлення: " . $message;
    $headers = "From: br.m.airways@gmail.com"; // Замініть на свою пошту

    if (mail($to, $subject, $body, $headers)) {
        echo "Повідомлення надіслано успішно!";
    } else {
        echo "Виникла помилка при надсиланні повідомлення.";
    }
}
?>
