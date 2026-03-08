const profile = {

name: "Gajapathy Dasarathan",

title: "Investment Reporting & Financial Reporting Professional",

summary: "Investment Reporting professional experienced in Private Equity, Hedge Funds and Separate Accounts. Strong interest in AI automation in finance including building Custom GPT tools for fund fact review and reporting efficiency.",

contact: "Email: gajapathy165@gmail.com | Phone: +91 93454 65667 | Chennai, India",

skills: [
"Financial Reporting",
"Private Equity",
"Hedge Funds",
"Mutual Funds",
"US GAAP",
"IFRS",
"Power BI",
"SQL",
"MS Excel",
"MS Access",
"AI Automation",
"Process Improvement",
"Investment Platforms"
],

experience: [

{
role:"Investment Reporting Analyst",
company:"Empower – Bengaluru",
period:"May 2025 – Present",
desc:"Preparing and reviewing mutual fund financial statements under US GAAP, automating fund fact reviews using Custom GPT tools and validating reporting data using SQL."
},

{
role:"Associate 2",
company:"State Street – Chennai",
period:"Oct 2022 – Apr 2025",
desc:"Prepared fund level financial statements for Private Equity, CLOs, REITs, Hedge Funds and Fund of Funds under US GAAP and IFRS."
},

{
role:"Intern",
company:"Rajesh and Ganesh Chartered Accountant – Chennai",
period:"Aug 2021 – Feb 2022",
desc:"Worked on forensic audit, cost audit, product costing and MIS reporting."
}

],

education: [
"CMA Intermediate – Institute of Cost Accountants of India",
"B.Com – DG Vaishnav College"
]

};


// Populate profile

document.getElementById("name").innerText = profile.name;
document.getElementById("title").innerText = profile.title;
document.getElementById("summary").innerText = profile.summary;
document.getElementById("contact").innerText = profile.contact;


// Skills

const skillsList = document.getElementById("skillsList");

profile.skills.forEach(skill=>{
let li=document.createElement("li");
li.innerText=skill;
skillsList.appendChild(li);
});


// Experience

const experienceList=document.getElementById("experienceList");

profile.experience.forEach(job=>{
let div=document.createElement("div");

let title=document.createElement("h3");
title.innerText=job.role;

let company=document.createElement("p");
company.innerText=job.company + " | " + job.period;

let desc=document.createElement("p");
desc.innerText=job.desc;

div.appendChild(title);
div.appendChild(company);
div.appendChild(desc);

experienceList.appendChild(div);
});


// Education

const educationList=document.getElementById("educationList");

profile.education.forEach(ed=>{
let li=document.createElement("li");
li.innerText=ed;
educationList.appendChild(li);
});


// Microblog example

const posts=[
{
title:"What is Fund Accounting?",
text:"Fund accounting tracks assets and liabilities of investment funds separately for each investor group."
},
{
title:"US GAAP vs IFRS",
text:"US GAAP is rule based accounting while IFRS focuses on principles."
}
];

const blog=document.getElementById("blogPosts");

posts.forEach(post=>{
let div=document.createElement("div");

let title=document.createElement("h3");
title.innerText=post.title;

let text=document.createElement("p");
text.innerText=post.text;

div.appendChild(title);
div.appendChild(text);

blog.appendChild(div);
});
