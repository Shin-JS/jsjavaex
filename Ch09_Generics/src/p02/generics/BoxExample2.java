package p02.generics;
/**[제네릭]
 * -.Generic타입으로 생성된 객체는 Casting이 일어나지 않음.
 * <객체타입>: <기본데이터타입>은 올 수 없음
 **/
public class BoxExample2 {
	public static void main(String[] args) {
		//Generic타입의 객체 생성
		//String타입으로 제한
		Box<String> box1 = new Box<String>();
		
		box1.set("Hello");
		String str = box1.get();//box에 String타입만 대입을 했기 때문에 Casting이 일어나지 않음
		System.out.println(str);
		
		//Integer타입으로 제한
		Box<Integer> box2 = new Box<Integer>();
		box2.set(6);
		int value = box2.get(); //Casting이 일어나지 않음, Auto-Unboxing이 일어남
		System.out.println(value);
		
	}
}
