class Timer {
    constructor(day, month, year) {
        this.day = day;
        this.month = month;
        this.year = year;
    }
    start() {
		let now = Date.now();
		let inputDate = new Date(`${this.year}-${this.month}-${this.day}`)
		inputDate = inputDate.getTime();
		let MS = inputDate - now;
		let S = Math.floor(MS/1000);
		let M = Math.floor(S/60);
		let H = Math.floor(M/60);
		let D = Math.floor(H/24);
		H = H - D*24;
		M = M - H*60 - D*24*60;
		S = S - M*60 - H*60*60 - D*24*60*60;
		return D;
    }
}


const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
new Vue({
	el: "#main", 
	data:{
        year: 0,
        month: 0,
        date: 2,
        cDate: new Date(),
		cDateISO: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().slice(0,10),
		temp: null,
		days:["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
		data:[],
		weeks: new Array(8),
		wMonth: "",
		deadline: localStorage.getItem('deadline-0') ?
			new Timer(localStorage.getItem('deadlineDate-0').split('-')[2], localStorage.getItem('deadlineDate-0').split('-')[1], localStorage.getItem('deadlineDate-0').split('-')[0]).start() :
			new Timer(31, 12, new Date().getFullYear()).start(),
		deadlineDate: localStorage.getItem('deadlineDate-0') ?
			localStorage.getItem('deadlineDate-0') :
			`${new Date().getFullYear()}-12-31`,
		dailyAverage: [],
		average: 0,
		project: {id: 0,
				  name: "Project", 
				  progress: 0, 
				  goal: 100, 
				  deadlineDate: `${new Date().getFullYear()}-12-31`},
		projects: [{id: 0, name: "Project", progress: 0, goal: 100, deadlineDate: `${new Date().getFullYear()}-12-31`}],
		projectId: 0,
		oldName: localStorage.getItem('name-0') ? localStorage.getItem('name-0') : "Progress"
	},
	methods:{
		getData:function(){
			document.getElementById("deadLine").min = this.cDateISO;
			let arr = [];
            for (let i = 1; this.temp.getMonth() == new Date(this.temp.getFullYear(), this.temp.getMonth(), i).getMonth(); i++) {
                arr.push({date: i, weekDay: new Date(this.temp.getFullYear(), this.temp.getMonth(), i).getDay()});
				if (i == this.temp.getDate()
				&& this.month-1 == this.cDate.getMonth()
				&& this.year == this.cDate.getFullYear()) {
					arr[arr.length-1].id = "today";
				}
				if (i == new Date(this.deadlineDate).getDate()
				&& this.month-1 == new Date(this.deadlineDate).getMonth()
				&& this.year == new Date(this.deadlineDate).getFullYear()) {
					arr[arr.length-1].id = "red";
				}
				if (new Date(this.temp.getFullYear(), this.temp.getMonth(), i+1) >= this.cDate ) {
					arr[arr.length-1].dAv = this.dailyAverage[Math.abs(Math.ceil((new Date(this.temp.getFullYear(), this.temp.getMonth(), i)-this.cDate)/(24*3600000)))];
				}
            }
			for (let i = 0; i+1 < arr[i].weekDay || (arr[i].weekDay == 0 && i < 6); i++) {
				arr.unshift({})
			}
			return arr;
		},
        changeMonth:function(){
			if (this.month%1) {
				this.month = Math.round(this.month);
			}
			if(this.month<1) {
				this.month = 12;
				this.year--;
			} else if (this.month>12) {
				this.month = 1;
				this.year++;
			}
            this.temp = new Date(this.year, this.month - 1, this.date);
            this.data = this.getData();
            this.weeks = new Array(Math.ceil(this.data.length/7));
            for (let i = 0; i < this.weeks.length; i++) {
                this.weeks[i] = this.data.slice(7*i, 7*i+7)
            }
        },
		changeProgress:function(){
			localStorage.setItem(`progress-${this.projectId}`, this.project.progress);
			localStorage.setItem(`goal-${this.projectId}`, this.project.goal);
			this.dailyAverage = avCounter(this.deadline, this.project.goal-this.project.progress);
			this.changeMonth();
		},
		changeDeadline:function(){
			this.deadline = new Timer(this.deadlineDate).start();
			localStorage.setItem(`deadline-${this.projectId}`, new Timer(this.deadlineDate).start());
			localStorage.setItem(`deadlineDate-${this.projectId}`, this.deadlineDate);
			
			this.changeProgress();
		},
		resetData:function(){
			if(confirm("This action will remove all the projects and their data. Proceed?")) {
				localStorage.clear();
				location.reload();
			}
		},
		activateNameInput:function(){
			document.getElementById("name").style.display = "none";
			document.getElementById("nameInput").style.display = "block";
		},
		changeName:function(){
			if (document.getElementById("nameInput").style.display == "block"
			&& document.getElementById("nameInput").value) {
				document.getElementById("name").innerHTML = `<b>${this.project.name}</b>`;
				document.getElementById("name").style.display = "block";
				document.getElementById("nameInput").style.display = "none";
				this.projects[this.projectId].name = this.project.name;
				localStorage.setItem(`name-${this.projectId}`, this.project.name);
			} else if (document.getElementById("name").style.display = "none") {
				document.getElementById("name").innerHTML = `<b>${this.oldName}</b>`;
				document.getElementById("name").style.display = "block";
				document.getElementById("nameInput").style.display = "none";
				this.projects[this.projectId].name = this.oldName;
			}
		},
		addProject:function() {
			let newId = this.projects[this.projects.length-1].id+1;
			this.projects.push({id: newId,
								name: `Project${newId}`, 
								progress: "0", 
								goal: "100", 
								deadlineDate: `${new Date().getFullYear()}-12-31`,
								deadline: new Timer(31, 12, new Date().getFullYear()).start()});
			this.projectId = newId;
			this.project = this.projects[this.projects.length-1];
			this.changeDeadline();
		},
		openProject:function(item) {
			if (item.id == this.projectId) {
				return;
			}
			let title = document.getElementById("name");
			if (title.style.display == "none") {
				this.changeName();
			}
			this.project = item;
			this.oldName = this.project.name.slice()
			this.projectId = item.id;
			title.innerHTML = `<b>${item.name}</b>`;
			this.deadlineDate = item.deadlineDate;
			this.deadline = item.deadline;
			this.invDeadlineCheck(this.deadlineDate)
		},
		removeProject:function() {
			if(confirm(`Are you sure you want to permanently remove project "${this.project.name}" and delete all its data?`)) {
				delete this.projects[this.projectId];
				for (let i = 0; i < localStorage.length; i++) {
					let prid = Object.keys(localStorage)[i].split('-')[1];
					if (prid == this.projectId) {
						localStorage.removeItem(Object.keys(localStorage)[i])
					}
				}
				if (this.projectId >= this.projects.length-1) {
					this.projects.pop();
					for (let i = this.projects.length-1; i >= 0; i--) {
						if (this.projects[i]) {
							this.openProject(this.projects[i])
							return;
						}
						this.projects.pop();
					}
				}
				for (let i = 0; i < this.projects.length; i++) {
					if (this.projects[i] && this.projects[i].id > this.projectId) {
						this.openProject(this.projects[i])
						return;
					}
				}
			}
		},
		invDeadlineCheck:function(deadlineDate) {
			let deadline = new Timer(deadlineDate.split('-')[2], deadlineDate.split('-')[1], deadlineDate.split('-')[0]).start();
			if (deadline < 0) {
				document.getElementById("invDeadline").style.display = "block";
				document.getElementById("deadLine").min = this.cDateISO;
				document.getElementById("table").style.display = "none";
				document.getElementById("calYear").style.display = "none";
				document.getElementById("calMonth").style.display = "none";
			} else {
				document.getElementById("invDeadline").style.display = "none";
				document.getElementById("table").style.display = "table";
				document.getElementById("calYear").style.display = "inline";
				document.getElementById("calMonth").style.display = "inline";
				this.changeDeadline();
			}
		}
	},

	created:function(){
        this.year = this.cDate.getFullYear()
        this.month = this.cDate.getMonth() + 1;
        this.date = this.cDate.getDate();
        this.day = this.cDate.getDay()
		this.temp = new Date(this.year, this.month - 1, this.date);
		if (localStorage.length) {
			for (let i = 0; i < localStorage.length; i++) {
				let prid = Object.keys(localStorage)[i].split('-')[1];
				if (prid) {
					if (!this.projects[prid]) {
						this.projects[prid] = {
							id: +prid,
							name: `Project${prid}`,
							progress: 0, 
							goal: 100, 
							deadlineDate: `${new Date().getFullYear()}-12-31`,
							deadline: 0
						}
					}
					let obj = {};
					let key = Object.keys(localStorage)[i].split('-')[0];
					let value = Object.values(localStorage)[i];
					obj[key] = value;
					Object.assign(this.projects[prid], obj)
				}
			}
		}
		this.project = this.projects[0];
		this.invDeadlineCheck(this.project.deadlineDate)
		this.dailyAverage = avCounter(this.project.deadline, this.project.goal-this.project.progress);
		this.data = this.getData();
		this.weeks = new Array(Math.ceil(this.data.length/7));
		for(let i = 0; i < this.weeks.length; i++){
			this.weeks[i] = this.data.slice(7*i, 7*i+7)
		}
        this.wMonth = months[this.cDate.getMonth()];
	}
})

function avCounter (days, units) {
	days++;
	let av = units/days;
	let dailyAv = new Array(days);
	for (let i = 0; i < dailyAv.length; i++) {
		dailyAv[i] = av == 0 ? '' : Math.ceil(av);
		days--;
		units -= Math.ceil(av);
		av = days?units/days:units;
	}
	return dailyAv;
}