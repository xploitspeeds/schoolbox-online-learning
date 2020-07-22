
class Enrollment {
    constructor(id, data, relationships) {
        this.id = id 
        this.link = data.link 
        this.user_id = data.user_id
        this.course_id = data.course_id
        this.lessons = relationships.lessons.data 
        Enrollment.all.push(this);
    }

    static createNewCourse() {
        main.innerHTML = ""
        main.innerHTML = `
        <h1>Input a new course. Start learning!</h1>
        <div class="form-group">
        <form id="new-course-form">
            <label>Course Title:</label> <input class="form-control" type='text'><br>
            <label>Course Description: </label><input class="form-control" type='text'><br>
            <label>Course Link: </label> <input class="form-control" type='text'><br>
            <label>Choose an existing platform or enter a new one: </label>
        </form>
        </div>`
        const newForm = document.getElementById("new-course-form")
        const platforms = document.createElement("select")
        platforms.className = "form-control"
        Platform.all.forEach(platform => {
            const option = document.createElement("option")
            option.id = platform.id 
            option.innerText = platform.name 
            platforms.append(option)
        })
        newForm.append(platforms)
        //option to create a new platform. 
        newForm.innerHTML += `
            <br><label>New Platform: </br><input class="form-control" type='text' id='new-platform'><br>
        `
        const submitButton = document.createElement("input")
        submitButton.type = "submit"
        submitButton.className = "form-control"

        newForm.addEventListener("submit", async function() {
            event.preventDefault()
            const courseTitle = event.target[0].value 
            const courseDescription = event.target[1].value 
            const link = event.target[2].value 
            const existingPlatform = event.target[3].value 
            const newPlatform = event.target[4].value 
            let platform_id; 
            let user_id = 1; //TODO: change this when login is introduced
            let course_id; 
            if (newPlatform.length > 0) {
                let x = await Platform.postNewPlatform(newPlatform)
                platform_id = Platform.all[Platform.all.length - 1].id 
            }
            else {
                platform_id = event.target[3].options[event.target[3].selectedIndex].id;
            }
            course_id = await Course.postNewCourse(courseTitle, courseDescription, platform_id)
            Enrollment.postNewEnrollment(link, user_id, course_id)
            newForm.reset()
            document.getElementById("all-courses").click()
        })

        newForm.append(submitButton)
    }

    static postNewEnrollment(link, user_id, course_id) {
        return fetch(baseURL + "enrollments", {
            method: "POST", 
            headers: {
                "Content-Type": "application/json", 
                Accept: "application/json"
            }, 
            body: JSON.stringify({
                link, 
                user_id, 
                course_id  
            })
        })
        .then(resp => resp.json())
        .then(obj => {
            new Enrollment(obj.data.id, obj.data.attributes, obj.data.relationships)
        })
    }

    async render() {
        let {title, description, platform_id} = await Course.fetchById(this.course_id)
        let {name} = await Platform.fetchById(platform_id)
        const course = document.createElement("div")
        course.style = "border-radius: 15px 30px; background-color: #549ad6"
        course.id = this.id
        course.className = "list-courses" 
        const h3 = document.createElement("h3")
        h3.innerText = ` 🏫 Course: ${title}`
        const desc = document.createElement("h5")
        desc.innerText = `Description: ${description}`
        const platform = document.createElement("h5")
        platform.innerText = `Platform: ${name}`
        course.append(h3, desc, platform)
        course.addEventListener("click", () => {
            this.individualCoursePage()
        })

        main.append(course)
    }


    async individualCoursePage() {
        main.innerHTML = ""
        const currentCourse = Enrollment.all.find(e => e.id === this.id)
        const currentLessonIds = currentCourse.lessons.map(lesson => lesson.id) 
        let {title, description, platform_id} = await Course.fetchById(currentCourse.course_id)
        let {name} = await Platform.fetchById(platform_id)
    
        //Need to format the individual course show page: 
        const h1 = document.createElement("h1")
        h1.innerText = `${title}: ${description}`
        const h3 = document.createElement("h3")
        h3.innerText = `Your are enrolled on: ${name}`
        
        //create button to link out to the course page
        const courseLink = document.createElement("a")
        courseLink.className = "btn btn-outline-info btn-lg"
        courseLink.href = `${this.link}`
        courseLink.role = "button"
        courseLink.target = "_blank"
        courseLink.innerText = "Go to Course Page"
        
        const listLessons = document.createElement("div")
        listLessons.className = "lessons"
        listLessons.innerHTML = `<br><h3><strong>Lessons:</strong></h3>`
        
        for (let itm of currentLessonIds) {
            //returns instance of Lesson class
            //TODO: i guess you could insert logic to check if Lesson.all has what you are looking for so no need to make fetch request
            let currentLesson = await Lesson.fetchById(itm) 
            let {name, description, date} = currentLesson 
            const singleLesson = document.createElement("div")
            singleLesson.style = "border-radius: 15px 30px; background-color: #549ad6"
            singleLesson.id = itm 
            singleLesson.innerHTML = `
                <h3>📖${name}</h3> 
                <h5>${description}</h5>
                <h5>Created: ${date}</h5>`

            //create event listener for when you click on 
            singleLesson.addEventListener("click", function() {
                currentLesson.individualLessonPage()
            })
            listLessons.append(singleLesson)
        }
        main.append(h1, h3, courseLink, listLessons)
    }
}
Enrollment.all = [];