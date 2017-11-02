package p02.inherits;
/**
 * 상속받은 자식의 클래스에서 기본생성자가 아닌 다른 생성자를 이용하여 자식을 생성하려할때,
 * super(매개변수)생성자를 이용하여 사용함 
 **/
public class Super2 {
 public static void main(String[] args) {
	 //생성시 부모생성자 부터 생성 후 자식생성자 실행
	C2 c = new C2(); //C2객체 생성
	c.c2();
	c.c1();
	
}//메인메소드 끝
}//Super2 클래스 끝
class C1 {
	//생성자
	C1(String str) {
		System.out.println("부모생성자 매개변수 1개: "+str);
	}
	//메소드
	void c1() {
		System.out.println("목요일");
	}
}//C1클래스 끝
class C2 extends C1{
	//생성자
	C2() {
		//super(): 부모생성자 호출 메소드는 항상 자식생성자의 실행블럭{}의 첫줄에 기술해야함
		super("부모생성자 호출"); //C1이 호출되었다........ new C1("부모생성자 호출") {} 과 같은결과
		System.out.println("매개변수가 없는 자식 생성자");
	}
	//메소드
	void c2() {
		System.out.println("자식메소드");
	}
}//C2클래스 끝