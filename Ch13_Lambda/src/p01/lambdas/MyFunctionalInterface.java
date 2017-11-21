package p01.lambdas;
/**
 * -.함수적 인터페이스: 추상메소드가 하나만 존재하는 인터페이스 
 **/
@FunctionalInterface //함수적인터페이스를 컴파일러에게 알려주는 어노테이션,필수는 아니지만 있는게 좋다
public interface MyFunctionalInterface {
	public void method1();
//	public void method2();
	
}
