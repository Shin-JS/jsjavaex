package p05.bounded;
/**[제네릭]
 * 타입제한
 * -.일부타입만 사용가능하게 타입을 제한하는 경우, 상속의 관계인 경우 사용
 **/
public class Util {
	public static <T extends Number> int compare(T t1, T t2) {
		double v1 = t1.doubleValue();//Double.doubleValue()
		double v2 = t2.doubleValue();//Double.doubleValue()
		return Double.compare(v1, v2);
	}
}
