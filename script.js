// Basic profile data

const profile = {
name: "Gajapathy",
role: "Cost & Management Accountant | Finance | Data Analytics",

about:
"Finance professional interested in fund accounting, financial reporting and financial analytics. I share educational microblogs explaining finance concepts in simple language.",

skills: [
"Fund Accounting",
"Financial Reporting",
"US GAAP",
"IFRS",
"Power BI",
"SQL",
"Excel"
]
};


// Insert profile data into website

document.getElementById("name").innerText = profile.name;
document.getElementById("role").innerText = profile.role;
document.getElementById("aboutText").innerText = profile.about;


// Skills

const skillsList = document.getElementById("skillsList");

profile.skills.forEach(skill=>{
let li=document.createElement("li");
li.innerText=skill;
skillsList.appendChild(li);
});


// Micro blog posts

const posts = [
{
title:"What is Fund Accounting?",
text:"Fund accounting is used by investment funds to track assets, liabilities and investor capital."
},
{
title:"US GAAP vs IFRS",
text:"US GAAP is rule-based while IFRS is principle-based accounting."
}
];


const blog = document.getElementById("blogPosts");

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
