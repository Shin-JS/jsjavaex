package p05.bounded;
/**[제네릭]
 * 
 **/
public class BoundedTypeParameterExample {
	public static void main(String[] args) {
//		String str = Util.compare("a", "b"); //Number를 상속받은 객체들만 대상 - 문자열은 올 수 없음
		int result1 = Util.compare(10, 20); //auto-boxing, auto-unboxing이 발생함(둘 다)
		System.out.println(result1);
		
		int result2 = Util.compare(4.5, 3); //double,int타입→Double,Integer
		System.out.println(result2);
		
	}
}
