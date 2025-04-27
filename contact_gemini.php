<?php
require __DIR__ . '/vendor/autoload.php'; // Підключення автозавантажувача Composer

use Dotenv\Dotenv;

// Завантаження змінних середовища з файлу .env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad(); // Використовуємо safeLoad, щоб не викидати помилку, якщо .env відсутній на продакшені

// Отримання API-ключа з змінних середовища
$apiKey = $_ENV['GEMINI_API_KEY'] ?? '';

// Обробка запиту для Gemini API
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['gemini_message'])) {
    // Перевірка наявності API-ключа
    if (empty($apiKey)) {
        http_response_code(500);
        echo json_encode(['error' => 'API ключ Gemini не знайдено.']);
        exit;
    }

    $message = $_POST['gemini_message'];
    $gemini_api_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' . $apiKey;

    // Ініціалізація cURL сесії
    $ch = curl_init($gemini_api_url);

    // Налаштування опцій cURL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'contents' => [
            [
                'parts' => [['text' => $message]],
            ],
        ],
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    // Виконання запиту та отримання відповіді
    $response = curl_exec($ch);

    // Перевірка на помилки cURL
    if (curl_errno($ch)) {
        $error_message = curl_error($ch);
        curl_close($ch);
        http_response_code(500);
        echo json_encode(['error' => 'Помилка cURL: ' . $error_message]);
        exit;
    }

    // Закриття cURL сесії
    curl_close($ch);

    // Встановлення заголовку Content-Type для JSON відповіді
    header('Content-Type: application/json');

    // Виведення отриманої відповіді від Gemini API
    echo $response;
    exit; // Важливо вийти після обробки запиту Gemini
}

// Обробка запиту контактної форми
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
    exit; // Важливо вийти після обробки форми
} else {
    http_response_code(405);
    echo "Method Not Allowed";
}
?>
