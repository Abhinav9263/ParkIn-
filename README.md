# 🚗 ParkIn: An AI-Powered Smart Parking System

<div align="center">
  <img src="https://github.com/SouravUpadhyay7/ParkingApp/blob/main/Images/logo.jpg" alt="ParkIn Logo" width="300"/>
  <br>
  <em>A Project by the Department of Computer Science and Engineering (Artificial Intelligence and Machine Learning)</em>
</div>

## 📋 Table of Contents
- [Introduction](#introduction)
- [Problem Statement](#problem-statement)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Implementation](#implementation)
- [Advantages](#advantages)
- [Screenshots](#screenshots)
- [Team Members](#team-members)
- [Installation](#installation)
- [References](#references)

## 🚀 Introduction

ParkIn is a cross-platform smart parking application that enables users to find, book, and manage parking spaces in real-time while allowing property owners to monetize their vacant spaces. The application is designed with intelligent features such as AI-driven recommendations, eco-friendly UI, and future integration with IoT sensors and ANPR systems.

With increasing urbanization, parking space management has become a growing concern in smart cities. This project addresses the pressing need for a scalable, intelligent, and user-friendly smart parking system, aligning with modern urban planning goals and sustainability initiatives.

## ❓ Problem Statement

Parking congestion is a major urban challenge that leads to increased traffic, fuel consumption, and frustration. The traditional method of searching for parking manually is inefficient and time-consuming.

**Key Challenges:**
- Lack of real-time parking space visibility
- Wastage of fuel and time due to manual search
- Inefficient monetization of private parking spaces
- No centralized platform for smart parking solutions

## ✨ Features

### For Users
- **Real-time parking search and booking**
- **AI-based parking recommendations**
- **Booking history and favorites**
- **Dark/light theme support**
- **Profile management**

### For Parking Space Owners
- **List available parking spaces**
- **View and manage bookings**
- **Track income and space usage**

### For Administrators
- **View all registered users**
- **Manage listings and moderate reported content**
- **Analytics and report generation** (future scope)

## 🏗️ System Architecture

ParkIn uses a layered architecture comprising:

- **Presentation Layer:** React Native UI components
- **Application Layer:** Business logic, API handling
- **Data Layer:** Firebase for authentication, MongoDB for storage
- **AI Layer:** Recommender system (Python Flask API)

<div align="center">
  <img src="https://via.placeholder.com/600x300" alt="ParkIn Architecture" width="600"/>
</div>

## 💻 Implementation

- Developed using **React Native** and **TailwindCSS** for modern UI
- **Firebase authentication** used for user management
- Mock data simulates booking, history, and favorites
- Modular code with future-proof architecture for IoT and AI integration

## 📱 Requirements

### Functional Requirements
- User registration and authentication
- Real-time parking search and booking
- Parking listing by owners
- AI-based recommendation engine
- User profile and booking history
- Dark/light theme support

### Non-Functional Requirements
- High performance
- User-friendly UI/UX
- Secure authentication and data storage
- Scalability
- Platform independence

### Hardware and Software Requirements
- Android/iOS device
- Firebase / MongoDB / Node.js Backend
- React Native frontend framework
- Internet connectivity

## 📈 Advantages

- **Cost Effective:** Minimal infrastructure needed; reuses user GPS and maps
- **Environment Friendly:** Reduces CO₂ emissions by optimizing parking search time
- **Highly Available:** Available on both Android and iOS via cloud sync
- **Easy to Use:** User-centric interface inspired by Zomato/Ola
- **Highly Scalable:** Cloud-ready and supports microservices for AI/IoT modules
- **Robust:** Secure authentication, fault-tolerant codebase

## 📸 Screenshots

<div align="center">
  <img src="https://github.com/SouravUpadhyay7/ParkingApp/blob/main/Images/home%20page.png" alt="Login Screen" width="500"/>
  <img src="https://github.com/SouravUpadhyay7/ParkingApp/blob/main/Images/map%20view.png" alt="Map View" width="500"/>
  <img src="https://github.com/SouravUpadhyay7/ParkingApp/blob/main/Images/list%20parking%20-%20customers.png" alt="Booking Screen" width="500"/>
  <img src="https://github.com/SouravUpadhyay7/ParkingApp/blob/main/Images/parking%20list%20-%20user.png" alt = "user parking" width="500"/>
  <img src="https://github.com/SouravUpadhyay7/ParkingApp/blob/main/Images/user%20profile.png" alt = "user Profile" width="500"/>
</div>

## 👥 Team Members

| Name | Roll | LinkedIn |
|------|------|----------|
| **Abhinav** (Team Lead) | 12130823001 | [LinkedIn](https://www.linkedin.com/in/abhinavbit/) |
| **Sourav Upadhyay** | 12130823044 | [LinkedIn](https://www.linkedin.com/in/sourav-upadhyay-00a975276/) |
| **Nishi Kumari** | 12130824047 | [LinkedIn](https://www.linkedin.com/in/nishi-kumari-184704277/) |
| **S.K. Arin** | 12130823043 | [LinkedIn](https://www.linkedin.com/in/sk-arin-1a7b37278/) |

*Department of Computer Science and Engineering (AI & ML)*  
*Bengal Institute of Technology, Kolkata, West Bengal, India*

## ⚠️ Disclaimer

**IMPORTANT:** For presentation and demonstration purposes, the current version of this project uses only HTML, CSS, Python and JavaScript. The fully functional mobile application with React Native and complete backend implementation is currently under development.

## 🛠️ Installation

```bash
# Clone the repository
https://github.com/SouravUpadhyay7/ParkingApp

# Navigate to the project directory
cd parkin

# For the demo version
# Simply open index.html in your browser

# For future full implementation
# npm install
# npm start
```

## 📚 References

1. Z. Pala and N. Inanc, "Smart parking applications using RFID technology," in 1st Annual Eurasia RFID Conference, September 2007.
2. Wand and W. He, "A reservation based smart parking system," in 1st Int'l Workshop on Cyber-Physical Networking Systems, April 2011.
3. N.H.H.M. Hanif, M.H. Badiozaman and H. Daud, "Smart parking reservation system using short message services (SMS)," in 2010 International Conference on Intelligent and Advanced Systems (ICIAS), June 2010.
4. S. Lee, D. Lee, and A. Park, "Smart Parking System Using RFID and Wireless Sensor Network," in ICT Convergence, October 2012.
5. H. Zhang and C. Lin, "Vehicle Parking Management using IoT and Cloud Computing," Journal of Advanced Transportation, 2018.
6. SpotHero Official App – https://spothero.com
7. Firebase Documentation – https://firebase.google.com/docs
8. React Native Docs – https://reactnative.dev/docs/getting-started
9. S. Mathur, T. Jin, N. Kasturirangan, W. Xue, M. Gruteser and W. Trappe, "Parknet: drive by sensing of road-side parking statistics" in Proceedings of the Eighth International Conference on Mobile Systems, applications and services (MobiSys‟10), ACM New York, June 2010
10. M. H. Gharavol, M. Pourtakdoust, and M. Zamani, "A Cloud-Based Parking Service System," in International Journal of Smart Grid and Clean Energy, 2015.

---

<div align="center">
  <p>© 2025 ParkIn</p>
  <p>Made with ❤️ by CSE (AI & ML) Students at Bengal Institute of Technology</p>
  
  <br>
  
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  </a>
</div>

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 ParkIn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
