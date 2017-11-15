package p06.wildcard;

import java.util.Arrays;

/**[제네릭]
 *  -.와일드카드<?>
 **/
public class WildCardExample {
	//모두 대입가능
	public static void registerCourse(Course<?>course) {
		System.out.println(course.getName() + " 수강생: " + Arrays.toString(course.getStudents())); //배열을 출력가능한 문자열로 바꿔주는 메소드 Arrays.toString
	}
	//Student와 HighStudent만 가능
	public static void registerCourseStudent(Course<? extends Student>course) {
		System.out.println(course.getName() + " 수강생: " + Arrays.toString(course.getStudents())); //배열을 출력가능한 문자열로 바꿔주는 메소드 Arrays.toString
	}
	//Worker와 Person만 가능
	public static void registerCourseWorker(Course<? super Worker>course) {
		System.out.println(course.getName() + " 수강생: " + Arrays.toString(course.getStudents())); //배열을 출력가능한 문자열로 바꿔주는 메소드 Arrays.toString
	}
	
	public static void main(String[] args) {
		Course<Person> personCourse = new Course<Person>("일반과정",5);
		personCourse.add(new Person("일반인"));
		personCourse.add(new Worker("직장인"));
		personCourse.add(new Student("학생"));
		personCourse.add(new HighStudent("고등학생"));
		
		Course<Worker> workerCourse = new Course<Worker>("직장인과정",5);
		workerCourse.add(new Worker("직장인"));
		
		Course<Student> studentCourse = new Course<Student>("학생과정",5);
		studentCourse.add(new Student("학생"));
		studentCourse.add(new HighStudent("고등학생"));
		
		Course<HighStudent> highStudentCourse = new Course<HighStudent>("고등학생과정",5);
		highStudentCourse.add(new HighStudent("고등학생"));
		
		//출력(메소드의 매개변수로 (<?>))
		registerCourse(personCourse);
		registerCourse(workerCourse);
		registerCourse(studentCourse);
		registerCourse(highStudentCourse);
		System.out.println();
		//메소드의 매개변수로 (<? extends Student>)
//		registerCourseStudent(personCourse);//제한해놔서 올 수 없음
//		registerCourseStudent(workerCourse);
		registerCourseStudent(studentCourse);
		registerCourseStudent(highStudentCourse);
		System.out.println();
		//메소드의 매개변수로 (<? super Worker>)
		registerCourseWorker(personCourse);
		registerCourseWorker(workerCourse);
//		registerCourseWorker(studentCourse); //메소드에서 제한해놔서 올 수 없음
//		registerCourseWorker(highStudentCourse);
		
		
	}
}
