package p01.tryCatchfinally;
/**[예외처리]
*	private String 타입의 상품명
*	private String 타입의 제조사
*	private int 타입의 qty
*	
**/
public class Stock {
	//필드
	private String ModelName;
	private String Manufacturer;
	private int qty;
	
	//생성자
	public Stock() {
	}
	public Stock(String modelName) {
		ModelName = modelName;
	}
	public Stock(String modelName, String manufacturer) {
		ModelName = modelName;
		Manufacturer = manufacturer;
	}
	public Stock(String modelName, String manufacturer, int qty) {
		ModelName = modelName;
		Manufacturer = manufacturer;
		this.qty = qty;
	}
	
	//메소드
	public String getModelName() {
		return ModelName;
	}
	public void setModelName(String modelName) {
		ModelName = modelName;
	}
	public String getManufacturer() {
		return Manufacturer;
	}
	public void setManufacturer(String manufacturer) {
		Manufacturer = manufacturer;
	}
	public int getQty() {
		return qty;
	}
	public void setQty(int qty) {
		this.qty = qty;
	}
	//입고처리 메소드
	public void inStock(int qty) { //원하는 수량을 메소드에 넘겨주는 역할(을 매개변수가..)
		this.qty += qty; //기존 필드에 매개변수로 넘어온 값을 누적
	}
	//출고처리 메소드
	//메소드 앞에 타입(int,byte,long,boolean,객체)가 있으면 실행부{}안에 return문이 있어야함
	public int outStock(int qty) throws Exception { //원하는 수량을 메소드에 넘기는 역할(을 매개변수가..)
		if(this.qty<qty) {
			throw new OutOfBalanceException("재고량이 모자랍니다. 현 재고:" +this.qty);
		}else {
			this.qty -=qty;  //필드의 역할: 현재고수량에서 원하는 양을 뺀값을 저장
		}
		return this.qty;
	}
}
//OutOfBalanceException(새로운 예외를 만들어서 사용해본거)
class OutOfBalanceException extends Exception{
	String message;
	OutOfBalanceException(String message){
		this.message = message;
	}
	@Override
	public String getMessage() {
		return message;
	}
}

