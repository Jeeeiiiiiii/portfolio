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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>

        {/* Article Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Featured Image */}
          <div className="relative h-64 md:h-96 rounded-t-lg overflow-hidden">
            <Image 
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Article Content */}
          <div className="p-8">
            {/* Post Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4 text-gray-900">{post.title}</h1>
              <div className="text-gray-800">{post.date}</div>
            </div>
            
            {/* Post Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-900 prose-li:text-gray-900 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="font-bold mb-4 text-gray-900">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Link 
                    key={index}
                    href={`/blog/tag/${tag.toLowerCase().replace(/ /g, '-')}`}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Share Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-bold mb-4 text-gray-900">Share this article:</h3>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-200 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-200 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
                <a href="#" className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-200 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </a>
                <a href="#" className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-200 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Posts */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">You might also like</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <h4 className="font-bold mb-2 text-gray-800">Next.js 13 App Router: A Complete Guide</h4>
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                  Explore the new App Router in Next.js 13 and learn how to leverage its powerful features...
                </p>
                <Link 
                  href="/blog/nextjs-13-app-router-guide"
                  className="text-blue-600 text-sm hover:underline font-medium"
                >
                  Read More →
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <h4 className="font-bold mb-2 text-gray-800">TypeScript Best Practices for React Developers</h4>
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                  Discover how to effectively use TypeScript with React to create more maintainable and error-free applications...
                </p>
                <Link 
                  href="/blog/typescript-best-practices-react"
                  className="text-blue-600 text-sm hover:underline font-medium"
                >
                  Read More →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}