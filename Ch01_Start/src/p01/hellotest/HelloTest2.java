package p01.hellotest;
/**
 * -.Java의 모든 클래스는 최상위클래스인 Object클래스로부터
 *  상속(Object클래스의 속성과 Method를 물려받는것)을 받아 생성된다.
 * -.생성자는 클래스명과 동일한 이름을 가진 메소드로 리턴부분이 없다.
 * -.생성자의 역할: 객체생성시 초기화를 위한 용도
 * -.클래스에서 매개변수가 없는 생성자(default생성자)를 쓰지않는경우
 *  컴파일시 jvm이 default생성자를 주입하여 컴파일한다. 
 **/
public class HelloTest2 /*extends Object*/{
	//생성자
	/*HelloTest2(){}*/
	//메소드
	public static void main(String[] args) {
		System.out.println("안녕하세요");

	}

}
