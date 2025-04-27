<?php
require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

$apiKey = $_ENV['GEMINI_API_KEY'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['gemini_message'])) {
    if (empty($apiKey)) {
        http_response_code(500);
        echo json_encode(['error' => 'API ключ Gemini не знайдено.']);
        exit;
    }

    $message = $_POST['gemini_message'];
    $gemini_api_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' . $apiKey;

    $ch = curl_init($gemini_api_url);
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

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        $error_message = curl_error($ch);
        curl_close($ch);
        http_response_code(500);
        echo json_encode(['error' => 'Помилка cURL: ' . $error_message]);
        exit;
    }

    curl_close($ch);

    header('Content-Type: application/json');
    echo $response;
    exit;
} else {
    http_response_code(405);
    echo "Method Not Allowed";
}
?>
