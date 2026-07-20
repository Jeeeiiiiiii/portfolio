import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';

interface BlogPost {
  title: string;
  date: string;
  image: string;
  content: string;
  tags: string[];
}

interface BlogPostsCollection {
  [key: string]: BlogPost;
}

const getBlogPost = (slug: string) => {
  const blogPosts: BlogPostsCollection = {
    "building-responsive-uis-with-tailwind": {
      title: "Deploying 2-tier Architecture on AWS through Terraform",
      date: "December, 2024",
      image: "/terraform_aws.jpg",
      content: `
        <div class="table-of-contents mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 class="text-xl font-bold mb-4">Table of Contents</h2>
          <ul class="space-y-2">
            <li><a href="#services" class="text-blue-600 hover:underline">📃 List of Services</a></li>
            <li><a href="#execution" class="text-blue-600 hover:underline">💡 Plan of Execution</a></li>
            <li><a href="#two-tier" class="text-blue-600 hover:underline">🏠 Two-tier Architecture</a></li>
            <li><a href="#architecture" class="text-blue-600 hover:underline">🏡 Architecture</a></li>
            <li><a href="#local-setup" class="text-blue-600 hover:underline">🖥️ Local Setup</a></li>
            <li><a href="#iam" class="text-blue-600 hover:underline">🚨 IAM Secret Key</a></li>
            <li><a href="#terraform" class="text-blue-600 hover:underline">✍️ Write Terraform Files</a></li>
            <li><a href="#outputs" class="text-blue-600 hover:underline">🖥️ Outputs</a></li>
            <li><a href="#resources" class="text-blue-600 hover:underline">📚 Resources</a></li>
          </ul>
        </div>

        <p style="color: #1f2937;">Terraform has revolutionized the way we deploy infrastructure on AWS. By using Infrastructure as Code (IaC), we can create consistent, version-controlled, and repeatable deployments.</p>
        
        <h2 id="services" class="text-2xl font-bold mt-8 mb-4">📃 List of Services</h2>
        <div class="relative h-64 mb-4 bg-gray-100 rounded-lg">
          <p class="text-center py-24 text-gray-800">Image placeholder for AWS services diagram</p>
        </div>
        <p style="color: #1f2937;">We'll be using the following AWS services for our two-tier architecture:</p>
        <ul style="color: #1f2937;">
          <li>Amazon VPC for networking</li>
          <li>EC2 for application tier</li>
          <li>RDS for database tier</li>
          <li>Security Groups for access control</li>
        </ul>

        <h2 id="execution" class="text-2xl font-bold mt-8 mb-4">💡 Plan of Execution</h2>
        <div class="relative h-64 mb-4 bg-gray-100 rounded-lg">
          <p class="text-center py-24 text-gray-800">Image placeholder for execution flow diagram</p>
        </div>
        <p style="color: #1f2937;">Our execution plan follows these steps:</p>
        <ol style="color: #1f2937;">
          <li>Set up VPC and networking components</li>
          <li>Create security groups</li>
          <li>Deploy EC2 instances</li>
          <li>Configure RDS database</li>
        </ol>

        <h2 id="two-tier" class="text-2xl font-bold mt-8 mb-4">🏠 Two-tier Architecture</h2>
        <div class="relative h-64 mb-4 bg-gray-100 rounded-lg">
          <p class="text-center py-24 text-gray-800">Image placeholder for two-tier architecture diagram</p>
        </div>
        <p style="color: #1f2937;">The two-tier architecture separates our application into:</p>
        <ul style="color: #1f2937;">
          <li>Frontend/Application Tier (Public Subnet)</li>
          <li>Database Tier (Private Subnet)</li>
        </ul>

        <h2 id="architecture" class="text-2xl font-bold mt-8 mb-4">🏡 Architecture</h2>
        <div class="relative h-64 mb-4 bg-gray-100 rounded-lg">
          <p class="text-center py-24 text-gray-800">Image placeholder for detailed architecture diagram</p>
        </div>
        <p style="color: #1f2937;">Our architecture ensures high availability and security through:</p>
        <ul style="color: #1f2937;">
          <li>Multiple Availability Zones</li>
          <li>Public and Private Subnets</li>
          <li>NAT Gateway for private subnet access</li>
        </ul>

        <h2 id="local-setup" class="text-2xl font-bold mt-8 mb-4">🖥️ Local Setup</h2>
        <p style="color: #1f2937;">Before we begin, ensure you have the following installed:</p>
        <pre style="color: #1f2937;"><code>
# Install Terraform
brew install terraform # For macOS
choco install terraform # For Windows

# Install AWS CLI
brew install awscli # For macOS
choco install awscli # For Windows</code></pre>

        <h2 id="iam" class="text-2xl font-bold mt-8 mb-4">🚨 IAM Secret Key</h2>
        <p style="color: #1f2937;">Configure your AWS credentials securely:</p>
        <pre style="color: #1f2937;"><code>aws configure
AWS Access Key ID: [Your Access Key]
AWS Secret Access Key: [Your Secret Key]
Default region name: [Your Region]
Default output format: json</code></pre>

        <h2 id="terraform" class="text-2xl font-bold mt-8 mb-4">✍️ Write Terraform Files</h2>
        <p style="color: #1f2937;">Create the following Terraform configuration files:</p>
        <pre style="color: #1f2937;"><code>
# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "two-tier-vpc"
  }
}

# EC2 Instance
resource "aws_instance" "app_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.public.id
  tags = {
    Name = "app-server"
  }
}

# RDS Instance
resource "aws_db_instance" "database" {
  engine               = "mysql"
  instance_class      = "db.t3.micro"
  allocated_storage   = 20
  subnet_group_name   = aws_db_subnet_group.private.name
}</code></pre>

        <h2 id="outputs" class="text-2xl font-bold mt-8 mb-4">🖥️ Outputs</h2>
        <div class="relative h-64 mb-4 bg-gray-100 rounded-lg">
          <p class="text-center py-24 text-gray-800">Image placeholder for terraform output results</p>
        </div>
        <p style="color: #1f2937;">After successful deployment, you should see the following outputs:</p>
        <ul style="color: #1f2937;">
          <li>VPC ID</li>
          <li>EC2 Instance Public IP</li>
          <li>RDS Endpoint</li>
        </ul>

        <h2 id="resources" class="text-2xl font-bold mt-8 mb-4">📚 Resources</h2>
        <ul style="color: #1f2937;">
          <li><a href="https://www.terraform.io/docs" class="text-blue-600 hover:underline">Terraform Documentation</a></li>
          <li><a href="https://aws.amazon.com/documentation/" class="text-blue-600 hover:underline">AWS Documentation</a></li>
          <li><a href="https://registry.terraform.io/providers/hashicorp/aws/latest/docs" class="text-blue-600 hover:underline">AWS Provider Documentation</a></li>
        </ul>
      `,
      tags: ["AWS", "Terraform", "DevOps", "Infrastructure as Code", "Cloud Architecture"]
    },
    "serverless-web-app-with-aws-lambda-and-api-gateway": {
      title: "Serverless Web Application with AWS Lambda and API Gateway",
      date: "March, 2025",
      image: "/serverless.png",
      content: `
        <div class="table-of-contents mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 class="text-xl font-bold mb-4">Table of Contents</h2>
          <ul class="space-y-2">
            <li><a href="#services" class="text-blue-600 hover:underline">📃 List of Services</a></li>
            <li><a href="#execution" class="text-blue-600 hover:underline">💡 Plan of Execution</a></li>
            <li><a href="#architecture" class="text-blue-600 hover:underline">🏡 Architecture</a></li>
            <li><a href="#local-setup" class="text-blue-600 hover:underline">🖥️ Local Setup</a></li>
            <li><a href="#iam" class="text-blue-600 hover:underline">🚨 IAM Role Setup</a></li>
            <li><a href="#lambda" class="text-blue-600 hover:underline">✍️ Lambda Functions</a></li>
            <li><a href="#api" class="text-blue-600 hover:underline">🔌 API Gateway Configuration</a></li>
            <li><a href="#dynamodb" class="text-blue-600 hover:underline">💾 DynamoDB Setup</a></li>
            <li><a href="#frontend" class="text-blue-600 hover:underline">🎨 Frontend Integration</a></li>
            <li><a href="#resources" class="text-blue-600 hover:underline">📚 Resources</a></li>
          </ul>
        </div>

        <p style="color: #1f2937;">Building a serverless To-Do List application using AWS services offers scalability, cost-effectiveness, and minimal maintenance overhead. Let's explore how to create this using AWS Lambda, API Gateway, and DynamoDB.</p>
        
        <h2 id="services" class="text-2xl font-bold mt-8 mb-4">📃 List of Services</h2>
        <div class="relative h-64 mb-4 bg-gray-100 rounded-lg">
          <p class="text-center py-24 text-gray-800">Image placeholder for AWS services architecture</p>
        </div>
        <p style="color: #1f2937;">Our application utilizes these AWS services:</p>
        <ul style="color: #1f2937;">
          <li>AWS Lambda for serverless compute</li>
          <li>API Gateway for RESTful API endpoints</li>
          <li>DynamoDB for serverless database</li>
          <li>IAM for security and access control</li>
        </ul>

        <h2 id="execution" class="text-2xl font-bold mt-8 mb-4">💡 Plan of Execution</h2>
        <div class="relative h-64 mb-4 bg-gray-100 rounded-lg">
          <p class="text-center py-24 text-gray-800">Image placeholder for execution flow diagram</p>
        </div>
        <p style="color: #1f2937;">Implementation steps:</p>
        <ol style="color: #1f2937;">
          <li>Set up DynamoDB table</li>
          <li>Create Lambda functions</li>
          <li>Configure API Gateway</li>
          <li>Implement Next.js frontend</li>
          <li>Test and deploy</li>
        </ol>

        <h2 id="architecture" class="text-2xl font-bold mt-8 mb-4">🏡 Architecture</h2>
        <div class="relative h-64 mb-4 bg-gray-100 rounded-lg">
          <p class="text-center py-24 text-gray-800">Image placeholder for serverless architecture diagram</p>
        </div>
        <p style="color: #1f2937;">The architecture follows these principles:</p>
        <ul style="color: #1f2937;">
          <li>RESTful API design</li>
          <li>Serverless compute with Lambda</li>
          <li>NoSQL database with DynamoDB</li>
          <li>Secure access with IAM roles</li>
        </ul>

        <h2 id="local-setup" class="text-2xl font-bold mt-8 mb-4">🖥️ Local Setup</h2>
        <pre style="color: #1f2937;"><code>
# Create Next.js project with Tailwind
npx create-next-app@latest . --typescript --tailwind
npm install @aws-sdk/client-dynamodb aws-sdk</code></pre>

        <h2 id="iam" class="text-2xl font-bold mt-8 mb-4">🚨 IAM Role Setup</h2>
        <p style="color: #1f2937;">Create an IAM role for Lambda with these permissions:</p>
        <pre style="color: #1f2937;"><code>{
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
}</code></pre>

        <h2 id="lambda" class="text-2xl font-bold mt-8 mb-4">✍️ Lambda Functions</h2>
        <p style="color: #1f2937;">Create Lambda functions for CRUD operations:</p>
        <pre style="color: #1f2937;"><code>// Create Todo Lambda Function
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
};</code></pre>

        <h2 id="api" class="text-2xl font-bold mt-8 mb-4">🔌 API Gateway Configuration</h2>
        <p style="color: #1f2937;">Set up API Gateway endpoints:</p>
        <ul style="color: #1f2937;">
          <li>POST /todos - Create todo</li>
          <li>GET /todos - List todos</li>
          <li>PUT /todos/{id} - Update todo</li>
          <li>DELETE /todos/{id} - Delete todo</li>
        </ul>

        <h2 id="dynamodb" class="text-2xl font-bold mt-8 mb-4">💾 DynamoDB Setup</h2>
        <p style="color: #1f2937;">Create DynamoDB table with schema:</p>
        <pre style="color: #1f2937;"><code>{
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
}</code></pre>

        <h2 id="frontend" class="text-2xl font-bold mt-8 mb-4">🎨 Frontend Integration</h2>
        <p style="color: #1f2937;">Implement Next.js components:</p>
        <pre style="color: #1f2937;"><code>// pages/index.tsx
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
}</code></pre>

        <h2 id="resources" class="text-2xl font-bold mt-8 mb-4">📚 Resources</h2>
        <ul style="color: #1f2937;">
          <li><a href="https://aws.amazon.com/lambda/" class="text-blue-600 hover:underline">AWS Lambda Documentation</a></li>
          <li><a href="https://aws.amazon.com/api-gateway/" class="text-blue-600 hover:underline">API Gateway Documentation</a></li>
          <li><a href="https://aws.amazon.com/dynamodb/" class="text-blue-600 hover:underline">DynamoDB Documentation</a></li>
          <li><a href="https://nextjs.org/docs" class="text-blue-600 hover:underline">Next.js Documentation</a></li>
        </ul>
      `,
      tags: ["AWS Lambda", "API Gateway", "DynamoDB", "Serverless", "Next.js", "Tailwind CSS"]
    }
  };
  
  return blogPosts[slug] || blogPosts["building-responsive-uis-with-tailwind"];
};



export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // Directly access `slug` from `params`

  // Get the blog post based on the slug
  const post = await getBlogPost(slug);

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 micro hover:text-ink transition-colors duration-200"
          >
            <ArrowLeft className="w-3 h-3" />
            back to blog
          </Link>
        </div>

        {/* Article */}
        <article>
          {/* Featured Image — dissolves into halftone dots at its base */}
          <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden border border-gray-200 mb-8">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover grayscale"
            />
            <div className="halftone-bottom absolute inset-x-0 bottom-0 h-16 pointer-events-none" aria-hidden />
          </div>

          <div>
            {/* Post Header */}
            <header className="mb-8">
              <p className="micro mb-3">{post.date}</p>
              <h1 className="text-[1.6rem] font-semibold tracking-tight leading-snug">{post.title}</h1>
            </header>

            {/* Post Content */}
            <div
              className="article-body max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            <div className="mt-12 pt-6 border-t border-gray-200">
              <h3 className="micro mb-4">tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-gray-300 px-2 py-px micro !text-[9px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
}