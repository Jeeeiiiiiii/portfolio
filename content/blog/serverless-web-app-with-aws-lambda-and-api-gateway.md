---
title: Serverless Web Application with AWS Lambda and API Gateway
date: 2025-03-01
excerpt: Learn how to build and deploy scalable, serverless web applications using AWS Lambda and API Gateway—no servers to manage, just clean, efficient code.
image: /serverless.png
tags: [AWS Lambda, API Gateway, DynamoDB, Serverless, Next.js, Tailwind CSS]
---

Building a serverless To-Do List application using AWS services offers scalability, cost-effectiveness, and minimal maintenance overhead. Let's explore how to create this using AWS Lambda, API Gateway, and DynamoDB.

## 📃 List of Services

Our application utilizes these AWS services:

- AWS Lambda for serverless compute
- API Gateway for RESTful API endpoints
- DynamoDB for serverless database
- IAM for security and access control

## 💡 Plan of Execution

Implementation steps:

1. Set up DynamoDB table
2. Create Lambda functions
3. Configure API Gateway
4. Implement Next.js frontend
5. Test and deploy

## 🏡 Architecture

The architecture follows these principles:

- RESTful API design
- Serverless compute with Lambda
- NoSQL database with DynamoDB
- Secure access with IAM roles

## 🖥️ Local Setup

```bash
# Create Next.js project with Tailwind
npx create-next-app@latest . --typescript --tailwind
npm install @aws-sdk/client-dynamodb aws-sdk
```

## 🚨 IAM Role Setup

Create an IAM role for Lambda with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:region:account-id:table/TodoTable"
    }
  ]
}
```

## ✍️ Lambda Functions

Create Lambda functions for CRUD operations:

```js
// Create Todo Lambda Function
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { title, description } = JSON.parse(event.body);

  const params = {
    TableName: 'TodoTable',
    Item: {
      id: Date.now().toString(),
      title,
      description,
      completed: false
    }
  };

  await dynamoDB.put(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(params.Item)
  };
};
```

## 🔌 API Gateway Configuration

Set up API Gateway endpoints:

- `POST /todos` - Create todo
- `GET /todos` - List todos
- `PUT /todos/{id}` - Update todo
- `DELETE /todos/{id}` - Delete todo

## 💾 DynamoDB Setup

Create DynamoDB table with schema:

```json
{
  "TableName": "TodoTable",
  "KeySchema": [
    { "AttributeName": "id", "KeyType": "HASH" }
  ],
  "AttributeDefinitions": [
    { "AttributeName": "id", "AttributeType": "S" }
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits": 5,
    "WriteCapacityUnits": 5
  }
}
```

## 🎨 Frontend Integration

Implement Next.js components:

```tsx
// pages/index.tsx
import { useState, useEffect } from 'react';

export default function TodoList() {
  const [todos, setTodos] = useState([]);

  const fetchTodos = async () => {
    const response = await fetch('/api/todos');
    const data = await response.json();
    setTodos(data);
  };

  // Add todo function
  const addTodo = async (todo) => {
    await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify(todo)
    });
    fetchTodos();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Todo list UI implementation */}
    </div>
  );
}
```

## 📚 Resources

- [AWS Lambda Documentation](https://aws.amazon.com/lambda/)
- [API Gateway Documentation](https://aws.amazon.com/api-gateway/)
- [DynamoDB Documentation](https://aws.amazon.com/dynamodb/)
- [Next.js Documentation](https://nextjs.org/docs)
