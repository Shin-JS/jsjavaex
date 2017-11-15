package p09.wrapper;
/**[API]
 * 
 **/
public class ValueCompareExample {
	public static void main(String[] args) {
		//값의 범위가 -128~127까지의 비교 vs -128 ~ 127을 초과한 값의 비교
		//-128~127초과시는 객체로 취급(내용은 같음)
		System.out.println("[-128~127 초과값인 경우]");
		Integer obj1 = 300;
		Integer obj2 = 300;
		System.out.println("==결과: " + (obj1==obj2));
		System.out.println("언박싱 후 결과: "+(obj1.intValue()==obj2.intValue()));
		System.out.println("equals()결과: " + obj1.equals(obj2));
		//-128~127사이의 값은 Integer를 같은 int로 취급한다
		System.out.println("[-128~127 범위내인 경우]");
		Integer obj3 = 10;
		Integer obj4 = 10;
		System.out.println("==결과: " + (obj3==obj4));
		System.out.println("언박싱 후 결과: "+(obj3.intValue()==obj4.intValue()));
		System.out.println("equals()결과: " + obj3.equals(obj4));
		
	}
}
