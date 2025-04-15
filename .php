<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST["email"]);
    $message = trim($_POST["message"]);

    
    if (empty($email)) {
        echo "Потрібно ввести електронну пошту.";
        exit;
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Некоректна електронна пошта.";
        exit;
    }

    if (empty($message)) {
        echo "Потрібно ввести повідомлення.";
        exit;
    }

    $to = "br.m.airways@gmail.com"; 
    $subject = "Нове повідомлення з сайту";
    $body = "Від: " . $email . "\r\nПовідомлення: " . $message;
    $headers = "From: br.m.airways@gmail.com"; 

    if (mail($to, $subject, $body, $headers)) {
        echo "Повідомлення надіслано успішно!";
    } else {
        echo "Виникла помилка при надсиланні повідомлення.";
    }
} else {
    http_response_code(405);
    echo "Method Not Allowed";
}
?>
