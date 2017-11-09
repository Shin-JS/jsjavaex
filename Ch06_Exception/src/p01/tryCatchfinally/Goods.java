package p01.tryCatchfinally;
/**[예외처리]
*	상품명 goodsName
*	상품가격 price
**/
public class Goods {
	//상수
	final int LIMIT = 200; //final 변수 = 상수, 가격상한과 하한을 위한 상수 설정 
	//필드
	private String goodsName;
	private int price;
	//생성자
	public Goods() {
//		super();//Goods는 Object를 상속받아서 생성되기때문에 여기서는 딱히 별로 필요 없음
	}
	public Goods(String goodsName) {
		this.goodsName = goodsName;
	}
	public Goods(String goodsName, int price) {
		this.goodsName = goodsName;
		this.price = price;
	}
	//메소드
	public String getGoodsName() {
		return goodsName;
	}
	public void setGoodsName(String goodsName) {
		this.goodsName = goodsName;
	}
	public int getPrice() {
		return price;
	}
	public void setPrice(int price) {
		this.price = price;
	}
	public void upPrice(int amount) throws Exception {
		if(amount > LIMIT) {
			throw new LimitOutException();
		}else {
			this.price += amount;
		}
	}
	public void downPrice(int amount) throws Exception {
		if(amount > LIMIT) {
			throw new LimitOutException();
		}else {
			this.price -= amount;
		}

	}
	
	
}
