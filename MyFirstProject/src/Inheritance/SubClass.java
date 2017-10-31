package Inheritance;

public class SubClass extends SuperClass {
	
	public SubClass() {
		super(); //상위클래스의 생성자를 호출
	}
	
	public SubClass(int num,String name) {
		super(num, name);
	}
	
}
