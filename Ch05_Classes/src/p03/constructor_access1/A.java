package p03.constructor_access1;
/**[접근제한]
 * 생성자의 접근제한 
 **/
public class A {
	//필드
	A a1 = new A(true);
	A a2 = new A(1);
	A a3 = new A("문자열");
	//생성자
	public A(boolean b) {}//public
	A(int b) {} //default
	private A(String s) {} //private
}
