package p07.extends_implements;
/**[제네릭]
 *  -.상속, 구현
 **/
public class ChildProductAndStorageExample {
	public static void main(String[] args) {
		//객체 생성
		ChildProduct<Tv, String, String> product = new ChildProduct<>();
		product.setKind(new Tv());
		product.setModel("SmartTv");
		product.setCompany("Sansung");
		//인터페이스타입<Tv> = new 구현체객체 생성
		Storage<Tv> storage = new StorageImple<>(100);
		storage.add(new Tv(), 0); //저장
		Tv tv = storage.get(0);
		System.out.println(tv);
		
	}
}
