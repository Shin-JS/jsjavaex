package p01.classes;

public class PersonExample3 {
	public static void main(String[] args) {
		Person3 person = new Person3("고길동",20);
		person.calc(); //Person객체의 속성으로 선언된(포함관계) Calculator객체의 메소드를 호출
		
	}
}
