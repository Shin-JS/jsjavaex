package p01.classes;
/** Person2클래스 활용
 * [은닉화(encapsulation)]
 *  -.객체의 속성을 보호하기위해 속성을 private접근제어자로 처리하고, 
 *    속성을 접근하는 메소드를 만들어서 외부에서 사용할때 속성의 접근은 반드시 메소드()를 통해서 
 *    접근할 수 있도록 하는 방식  
 **/
public class PersonExample2 {
	public static void main(String[] args) {
		Person2 person2 = new Person2();
		person2.setName("고길동");
		person2.setAge(49);
		
		System.out.println(person2.getName() + "의 나이는 "+person2.getAge()+"살입니다.");
		
		person2.setName("둘리");
		person2.setAge(-100000000); //음수값일경우 person2클래스에서 처리한대로 return받아서 이전에 입력받은값 출력됨
		System.out.println(person2.getName() + "의 나이는 "+person2.getAge()+"살입니다.");
	}
}
