package p01.lambdas;
/**
 * -.매개변수가 있는 추상메소드를 가진 함수적인터페이스
 * 리턴값도 있음
 **/
@FunctionalInterface
public interface MyFunctionalInterface3 {
	//int타입의 값 2개를 받아서 int타입의 결과를 리턴하는 추상메소드
	public int method(int x, int y);
}
