package p04.methods;
/**[제네릭]
 * -.제네릭메소드
 **/
public class BoxingMethodExample {
	public static void main(String[] args) {
		//메소드 호출:           <타입>메소드(값);
		Box<Integer> box2 = Util.<Integer>boxing(100);
		int intValue = box2.get();
		System.out.println(intValue);
		//메소드 호출:         메소드(값);(왼쪽에 제네릭타입이 지정되어있어서 안써도 무방)
		Box<String>box3 = Util.boxing("홍길동");
		String strValue = box3.get();
		System.out.println(strValue);
	}
}
