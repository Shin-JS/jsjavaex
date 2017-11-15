package p03.multi_generics;
/**[제네릭]
 * -. 멀티 제네릭타입<T,M,P>: <>안에 선언된 3개의 타입만으로 처리해야함
 **/
public class ProductExample {
	public static void main(String[] args) {
		Product<Tv, String, Integer> product = new Product<>(); //왼쪽에 <T,M,P>가 있으므로 생략가능(자바7에서 추가)
		product.setKind(new Tv());
		product.setModel("스마트Tv");
		product.setPrice(new Integer(1000000));
		product.setQty(10);//auto-Boxing
		
		Tv tv = product.getKind(); //T
		String tvModel =  product.getModel();//M
		int price = product.getPrice(); //P
		int qty = product.getQty(); //P
		System.out.println(tv+" "+tvModel+" "+price+" "+qty);

	}
}
