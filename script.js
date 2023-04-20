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
        month: 1,
        date: 2,
        cDate: new Date(),
		cDateISO: () => {return new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().slice(0,10)},
		temp: null,
		days:["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
		data:[],
		weeks: new Array(8),
		wMonth: "",
		dailyAverage: [],
		average: 0,
		project: {id: 0,
				  name: "Project", 
				  progress: 0, 
				  goal: 100, 
				  deadlineDate: `${new Date().getFullYear()}-12-31`},
		projects: [{id: 0, name: "Project", progress: 0, goal: 100, deadlineDate: `${new Date().getFullYear()}-12-31`}],
		projectId: 0,
		oldName: localStorage.getItem('name-0') ? localStorage.getItem('name-0') : "Project",
		nameInputActive: false,
		minDeadlineDate: ''
	},
	methods:{
		getData:function(){
			let arr = [];
			let markedDaysArr = Object.keys(localStorage).filter(key => key.includes("/"));
            for (let i = 1; this.temp.getMonth() == new Date(this.temp.getFullYear(), this.temp.getMonth(), i).getMonth(); i++) {
                arr.push({date: i, weekDay: new Date(this.temp.getFullYear(), this.temp.getMonth(), i).getDay()});
				let day = arr[arr.length-1]
				let markedDay = this.month+"/"+i+"/"+this.year;
				if (markedDaysArr.includes(markedDay)
				&& localStorage[markedDay].split(",").includes(''+this.projectId)) {
					day.marked = true;
				}
				if (i == this.temp.getDate()
				&& this.month-1 == this.cDate.getMonth()
				&& this.year == this.cDate.getFullYear()) {
					day.id = "today";
				}
				if (i == new Date(this.project.deadlineDate).getDate()
				&& this.month-1 == new Date(this.project.deadlineDate).getMonth()
				&& this.year == new Date(this.project.deadlineDate).getFullYear()) {
					day.id = "red";
				}
				if (new Date(this.temp.getFullYear(), this.temp.getMonth(), i+1) >= this.cDate ) {
					day.dAv = this.dailyAverage[Math.abs(Math.ceil((new Date(this.temp.getFullYear(), this.temp.getMonth(), i)-this.cDate)/(24*3600000)))];
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
			if (this.project.progress < 0 || this.project.progress > this.project.goal || this.project.goal < this.project.progress
				//  || typeof this.project.progress !== 'number' || typeof this.project.goal !== 'number'
			) {
				this.project.progress = +localStorage.getItem(`progress-${this.projectId}`)
				this.project.goal = +localStorage.getItem(`goal-${this.projectId}`)
				return;
			}
			if (typeof this.project.progress == 'string') {
				this.project.progress = + this.project.progress
			}
			if (!this.project.todayMarked) {
				this.dailyAverage = avCounter(this.project.deadline, this.project.goal-this.project.progress);
				this.project.todayAv = this.dailyAverage[0]
			} else {
				this.dailyAverage = avCounter(this.project.deadline-1, this.project.goal-this.project.progress)
				this.dailyAverage.unshift(null)
			}
			localStorage.setItem(`progress-${this.projectId}`, this.project.progress);
			localStorage.setItem(`goal-${this.projectId}`, this.project.goal);
			this.changeMonth();
		},
		changeDeadline:function(){
			this.project.deadline = new Timer(this.project.deadlineDate).start();
			localStorage.setItem(`deadline-${this.projectId}`, new Timer(this.project.deadlineDate).start());
			localStorage.setItem(`deadlineDate-${this.projectId}`, this.project.deadlineDate);
			
			this.changeProgress();
		},
		resetData:function(){
			if(confirm("This action will remove all the projects and their data. Proceed?")) {
				localStorage.clear();
				location.reload();
			}
		},
		activateNameInput:function(){
			this.nameInputActive = true;
			setTimeout(() => {
				document.getElementById("nameInputId").focus()
			}, 10)
		},
		changeName:function() {
			if (this.project.name.length) {
				this.projects[this.projectId].name = this.project.name;
				localStorage.setItem(`name-${this.projectId}`, this.project.name);
			} else {
				let old = localStorage[`name-${this.projectId}`] ? localStorage[`name-${this.projectId}`] : "Project"
				this.projects[this.projectId].name = old;
			}
			this.nameInputActive = false;
		},
		addProject:function() {
			if (this.nameInputActive) {
				this.nameInputActive = false;
			}
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
			if (this.nameInputActive) {
				this.nameInputActive = false;
			}
			this.project = item;
			this.oldName = this.project.name.slice()
			this.projectId = item.id;
			this.invDeadlineCheck(this.project.deadlineDate)
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
		},
		markUnmark:function(day) {
			let markedDay = this.month+"/"+day.date+"/"+this.year;
			if (new Date(markedDay) <= new Date()) {
				if (Object.keys(localStorage).includes(markedDay)) {
					let projectsArr = localStorage[markedDay].split(",")
					if (projectsArr.includes(''+this.projectId)) {
						let i = projectsArr.indexOf(''+this.projectId)
						projectsArr.splice(i,1)
						// document.getElementById(id).childNodes[0].childNodes[2].style.animation = "dash 1.5s reverse";
						// document.getElementById(id).childNodes[0].childNodes[2].style.strokeDashoffset = "320";
						if (projectsArr[0]) {
							localStorage[markedDay] = projectsArr.toString()
						} else {
							delete localStorage[markedDay]
						}
						// The day is marked on the project and other projects. The mark needs to be removed, the progress decreased using the storage data (todayAv).
						if (new Date(markedDay).toDateString() == new Date().toDateString()) {
							localStorage.removeItem(`todayAv-${this.projectId}-${this.project.todayAv}`)
							this.dailyAverage[0] = this.project.todayAv;
							this.project.progress -= this.project.todayAv;
							if (this.project.progress < 0) {
								this.project.progress = 0
							}
							this.project.todayMarked = false;
							this.changeProgress()
						}
					} else {
						localStorage[markedDay] += ',' + this.projectId
						// The day is not marked on this project but is marked on other projects. The mark needs to be added, the progress incresed using dAv value. The dAv value then needs to be stored as todaAv in case the mark is removed today.
						if (new Date(markedDay).toDateString() == new Date().toDateString()) {
							localStorage.setItem(`todayAv-${this.projectId}-${day.dAv}`, new Date().toDateString())
							this.dailyAverage[0] = null;
							this.project.progress += day.dAv;
							this.project.todayMarked = true;
							this.changeProgress()
						}
					}
				} else {
					localStorage.setItem(markedDay, this.projectId)
					// The day isn't marked. The mark needs to be added, the progress incresed using dAv value. The dAv value then needs to be stored as todaAv in case the mark is removed today.
					if (new Date(markedDay).toDateString() == new Date().toDateString()) {
						localStorage.setItem(`todayAv-${this.projectId}-${day.dAv}`, new Date().toDateString())
						this.dailyAverage[0] = null;
						this.project.progress += day.dAv;
						this.project.todayMarked = true;
						this.changeProgress()
					}
				}
				this.changeMonth()
			}
		}
	},

	created:function(){
        this.year = this.cDate.getFullYear()
        this.month = this.cDate.getMonth() + 1;
        this.date = this.cDate.getDate();
        this.day = this.cDate.getDay()
		this.temp = new Date(this.year, this.month - 1, this.date);
		this.minDeadlineDate = `${this.year}-${this.month > 10 ? this.month : '0' + this.month}-${this.date > 9 ? this.date : '0' + this.date}`;
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
					if (key == 'goal' || key == 'deadline' || key == 'progress') {
						value = +value
					}
					if (key == 'todayAv' && new Date(value).toDateString() !== new Date().toDateString()) {
						localStorage.removeItem(Object.keys(localStorage)[i])
						i--
					} else {
						if (key == 'todayAv') {
							obj[key] = Object.keys(localStorage)[i].split('-')[2]
							Object.assign(this.projects[prid], {todayMarked: true})
						} else {
							obj[key] = value;
						}
						Object.assign(this.projects[prid], obj)
					}
				}
			}
		}
		this.project = this.projects[0];
		this.invDeadlineCheck(this.project.deadlineDate)
		if (this.project.todayMarked) {
			this.dailyAverage = avCounter(this.project.deadline-1, this.project.goal-this.project.progress)
			this.dailyAverage.unshift(null)
		} else {
			this.dailyAverage = avCounter(this.project.deadline, this.project.goal-this.project.progress);
		}
		this.project.todayAv = this.project.todayAv ? this.project.todayAv : this.dailyAverage[0]
		this.data = this.getData();
		this.weeks = new Array(Math.ceil(this.data.length/7));
		for(let i = 0; i < this.weeks.length; i++){
			this.weeks[i] = this.data.slice(7*i, 7*i+7)
		}
        this.wMonth = months[this.cDate.getMonth()];
		// Reloads the page at 12:00 A.M. Timer is set to milliseconds till tomorrow.
		setTimeout(() => {
			location.reload()
		}, Math.abs(new Date(new Date(new Date(new Date(new Date(Date.now()+86400000).setHours(0)).setMinutes(0)).setSeconds(0)).setMilliseconds(0)).getTime()-Date.now()))
	}
})

document.getElementById("main").style.visibility = "visible"

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
