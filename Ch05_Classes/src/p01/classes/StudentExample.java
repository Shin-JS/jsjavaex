package p01.classes;
/** Student 클래스 활용 
 * 사용할 클래스의 instance는 new 생성자();에 의해 만들어지고, 생성된 instance의 속성,메소드에 접근하기 위해서는
 * 참조하는 변수.속성, 변수.메소드()로 접근
 **/
public class StudentExample {
	public static void main(String[] args) {
		Student student;  //student는 null값을 가짐
		student = new Student(); //Student객체(instance)생성 후 번지값을 student에 대입
		student.name = "이성계"; //생성한 instance의 속성접근 => 참조변수.속성;
		student.no = 10; //생성한 instance의 속성접근 => 참조변수.속성;
		student.getName(); //생성한 instance의 메소드 접근=> 참조변수.메소드;
		student.getNo();//생성한 instance의 메소드 접근=> 참조변수.메소드;
	}
}
