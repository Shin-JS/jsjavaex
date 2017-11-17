package p08.compare;
/**[2진트리]
 * 객체 저장
 * Comparable인터페이스 구현
 **/
public class Person implements Comparable<Person> {
	//필드: 객체의 고유 속성, 현재의 상태를 저장하는 역할
	public String name;
	public int age;
	//생성자
	public Person(String name, int age) {
		this.name = name;
		this.age = age;
	}
	//메소드
	@Override //객체 저장시 비교용으로 사용됨
	public int compareTo(Person o) {
		if(this.age<o.age) {
			return -1; //음수
		}else if(this.age==o.age) {
			return 0; //0
		}else {
			return 1; //양수	
		}
	}
}
